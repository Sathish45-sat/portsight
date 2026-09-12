# PortSight — Implementation Guide (Phases 3–15)

**Document Version:** 1.0
**Companion to:** `01_Project_Plan.md`,`03_System_Design.md`
**Purpose:** A single reference for actually building PortSight, phase by phase. Planning (Phase 0) and Architecture/Database design (Phases 1–2) are already complete and live in the companion docs — this picks up from Phase 3 through launch.

---

## Phase 3 — Backend Foundation

**Goal:** Project skeleton only. No business logic yet.

### Project setup
Generate via [start.spring.io](https://start.spring.io): Maven, Java 21, Group `com.portsight`, Artifact `portsight`.

**Dependencies:** Spring Web, Spring Data JPA, PostgreSQL Driver, Spring Security, Validation, Flyway, Lombok, DevTools (optional).

**Add manually to `pom.xml`:**
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.6.0</version>
</dependency>
```

### Package skeleton
```
com.portsight
├── config
├── security
├── controller
├── service
├── analytics
│   └── costbasis
├── price
├── scheduler
├── repository
├── entity
├── dto
│   ├── request
│   └── response
├── mapper
├── exception
└── util
```

### `application.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/portsight
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate   # Flyway owns the schema, not Hibernate
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: ${JWT_SECRET}
  expiration-ms: 86400000

server:
  port: 8080

springdoc:
  swagger-ui:
    path: /swagger-ui.html
```

`.env` (gitignored) holds `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`. Add `.gitignore` (`.env`, `target/`, `.idea/`, `*.iml`) **before the first commit**.

### First Flyway migration
`src/main/resources/db/migration/V1__init_schema.sql` — the five tables from the Architecture doc: `users`, `portfolios`, `assets`, `transactions`, `portfolio_snapshots`, including FK constraints, CHECK constraints, and the unique `(portfolio_id, snapshot_date)` index.

### Scaffold (empty for now, filled in Phase 4)
`config/SecurityConfig.java` (permit-all placeholder), `config/SwaggerConfig.java`, `security/JwtTokenProvider.java`, `security/JwtAuthenticationFilter.java`.

### Exit checklist
- [ ] `mvn spring-boot:run` starts clean
- [ ] Flyway applies migration; all 5 tables exist with correct constraints
- [ ] `/swagger-ui.html` loads
- [ ] `.env` confirmed absent from `git status`
- [ ] First commit: `"Phase 3: backend foundation - skeleton, config, initial schema"`

---

## Phase 4 — Authentication & Security

**Goal:** Working JWT login/register, reused from Knowledge Vault's pattern.

### Build
- `entity/User.java` — id, email (unique), passwordHash, createdAt
- `repository/UserRepository.java`
- `security/JwtTokenProvider.java` — generate/validate/parse token, using `jwt.secret` and `jwt.expiration-ms`
- `security/JwtAuthenticationFilter.java` — runs once per request, populates `SecurityContext` from a valid token
- `security/UserDetailsServiceImpl.java`
- `service/AuthService.java` — register (BCrypt-hash password), login (authenticate + issue token)
- `controller/AuthController.java` — `POST /api/auth/register`, `POST /api/auth/login`
- `dto/request/RegisterRequest.java`, `LoginRequest.java`, `dto/response/AuthResponse.java` (returns JWT)
- Update `SecurityConfig.java`: permit `/api/auth/**` and `/swagger-ui/**`, require auth on everything else

### Key rule
Passwords are BCrypt-hashed, never stored or logged in plaintext. JWT secret comes from an environment variable — never hardcoded, never committed.

### Exit checklist
- [ ] Register creates a user with a hashed password
- [ ] Login returns a valid JWT
- [ ] A request to a protected endpoint without a token returns 401
- [ ] A request with a valid token passes through the filter

---

## Phase 5 — Portfolio Module

### Build
- `entity/Portfolio.java` — id, userId (FK), name, createdAt
- `repository/PortfolioRepository.java`
- `service/PortfolioService.java` — CRUD, **every method checks the requesting user owns the portfolio**
- `controller/PortfolioController.java` — full CRUD per the API Overview
- `dto` + `mapper` for Portfolio
- `exception/PortfolioNotOwnedException.java` → mapped to 403 in `GlobalExceptionHandler`

### Exit checklist
- [ ] User A cannot read/edit/delete User B's portfolio (test explicitly, not just by inspection)
- [ ] CRUD endpoints return correct DTOs, never raw entities

---

## Phase 6 — Asset Module

### Build
- `entity/Asset.java` — id, portfolioId (FK), symbol, name, assetType (STOCK/MUTUAL_FUND), currentPrice, **avgBuyPrice, quantityHeld** (cached fields per Architecture Decision 8.1)
- `repository/AssetRepository.java`
- `service/AssetService.java` — CRUD, asset type restricted to the two V1 enum values
- `controller/AssetController.java`
- `price/PriceProvider.java` (interface) + `price/ManualPriceProvider.java` (implementation) — wired so `PUT /api/assets/{id}/price` goes through the interface, not a hardcoded field update
- Confirm asset deletion cascades to its transactions (per Decision 8.2) and is documented as destructive in the API response/Swagger description

### Exit checklist
- [ ] Adding an asset with an invalid `assetType` is rejected
- [ ] Deleting an asset removes its transactions (test the cascade explicitly)
- [ ] Price updates go through `PriceProvider`, not a direct setter call from the controller

---

## Phase 7 — Transaction Module

**This is where correctness matters most before Phase 8 depends on it.**

### Build
- `entity/Transaction.java` — id, assetId (FK), type (BUY/SELL), quantity, price, transactionDate, createdAt
- `repository/TransactionRepository.java`
- `service/TransactionService.java`:
    - Validates: quantity > 0, price > 0, SELL quantity ≤ current `quantityHeld`
    - On BUY: recompute `avgBuyPrice` as the weighted average of old holdings + new purchase; increase `quantityHeld`
    - On SELL: decrease `quantityHeld`; `avgBuyPrice` is unchanged by a SELL under WAC (only BUYs move the average)
    - **Entire operation (transaction insert + Asset cache update) wrapped in one `@Transactional` method** (Architecture Decision 8.1)
    - Duplicate detection: reject an identical transaction (same asset, type, quantity, price, timestamp) submitted twice in immediate succession
- `controller/TransactionController.java` — no DELETE endpoint (Decision 8.2: append-only)
- `exception/InsufficientHoldingsException.java`, `DuplicateTransactionException.java`

### Concurrency
Add either optimistic locking (`@Version` on `Asset`) or a pessimistic `SELECT ... FOR UPDATE` when applying a transaction, per Architecture Decision 8.1's concurrency note. Optimistic is the simpler starting point.

### Exit checklist
- [ ] Cannot sell more than currently held (test at the exact boundary: selling exactly `quantityHeld` succeeds, selling one more unit fails)
- [ ] Average buy price matches hand-calculated values across a multi-BUY sequence (write these test cases before writing the code — see Phase 8 note)
- [ ] Two rapid concurrent SELLs against the same asset cannot both succeed if only one has enough holdings

---

## Phase 8 — Portfolio Analytics Engine ⭐ (the hero feature)

**Do not start this until Phase 7's cached values are verified correct — this engine's output is only as correct as the data it reads.**

### Build order
1. `analytics/costbasis/CostBasisStrategy.java` (interface) + `WeightedAverageCostStrategy.java` — isolates the WAC logic so FIFO can be swapped in later (V2) without touching engines
2. `analytics/ValuationEngine.java` — total investment, current value, return %, daily change
3. `analytics/ProfitEngine.java` — realized profit (on SELL, using the strategy) and unrealized profit (current holdings vs. current price)
4. `analytics/AllocationEngine.java` — percentage breakdown by asset
5. `analytics/PerformanceEngine.java` — best/worst performer, highest gain, largest investment
6. `analytics/DashboardAggregatorService.java` — composes 2–5 into one response

### Testing approach (do this first, not last)
Before writing engine code, write out 4–6 hand-calculated scenarios on paper: e.g. "BUY 100 @ ₹100, BUY 50 @ ₹120, SELL 80 → expected avgBuyPrice = ?, expected realized profit = ?, expected unrealized profit at current price ₹150 = ?" Turn each into a JUnit test case with the expected numbers hardcoded, then write the engine to make them pass.

### Exit checklist
- [ ] All hand-calculated test cases pass
- [ ] `DashboardAggregatorService` returns one combined DTO in a single call
- [ ] All monetary math uses `BigDecimal` — no `double`/`float` anywhere in the analytics package

---

## Phase 9 — Dashboard (backend side)

### Build
- `controller/DashboardController.java` — `GET /api/portfolios/{id}/dashboard` wired to `DashboardAggregatorService`
- `dto/response/DashboardResponse.java` — combined shape: valuation, profit, allocation, performance, recent snapshots

### Exit checklist
- [ ] One API call returns everything the frontend dashboard needs

---

## Phase 10 — Frontend

### Build order
1. `api/` — Axios instance with JWT request interceptor + 401 response interceptor
2. `context/AuthContext.jsx` — holds JWT + current user, wraps the app
3. `routes/` — `AppRouter.jsx`, `ProtectedRoute.jsx`
4. Pages: Login, Register, Dashboard, PortfolioDetail
5. Components: dashboard cards (valuation, allocation chart, growth chart, performer list), portfolio/asset/transaction forms and lists
6. Wire Dashboard page to the single aggregated endpoint from Phase 9

### Exit checklist
- [ ] Full flow works clicking through the UI: register → login → create portfolio → add asset → record BUY/SELL → see dashboard update
- [ ] Loading and error states present on every API-backed component

---

## Phase 11 — Testing

### Build
- JUnit 5 + Mockito unit tests, concentrated on `analytics/` (highest risk of silent bugs)
- Integration tests for `TransactionService` validation rules (overselling, negative quantity, duplicates)
- Postman collection covering all ~20 endpoints, exported and committed to the repo
- Edge cases: selling exact holdings, selling built up from multiple BUY lots, a portfolio with zero transactions, concurrent SELL race condition

### Exit checklist
- [ ] All analytics test cases from Phase 8 pass in CI, not just locally
- [ ] Postman collection runs clean against a fresh database

---

## Phase 12 — Deployment

### Build
- `Dockerfile` for the Spring Boot app
- Deploy backend + PostgreSQL to Render or Railway
- Deploy frontend to Vercel or Netlify
- Set environment variables (`DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`) in the hosting platform's config — never in code

### Exit checklist
- [ ] App reachable via a public URL end-to-end (frontend talking to deployed backend)
- [ ] Flyway migrations run automatically on deploy

---

## Phase 13 — GitHub

- Feature branches per phase (`feature/analytics-engine`, `feature/auth`), merged via PR even solo
- One GitHub Issue per phase/module; label `v1` vs `v2-backlog` (park FIFO, live pricing, corporate actions, RBAC, etc. here — never silently drop them)
- GitHub Project board: Backlog / In Progress / Done
- Milestones matching major phases; tag `v1.0.0` once deployed
- Steady commit cadence across the build window, not one large end-of-project dump

---

## Phase 14 — Documentation

- `README.md` — what it does, tech stack, architecture diagram, live demo link, Design Decisions section (WAC choice, cached-holdings choice, no-delete choice, PriceProvider abstraction)
- Architecture, ER, and sequence diagrams (already produced — link/embed them)
- API docs — live via `/swagger-ui.html`, plus the static API Overview table for quick reference
- Developer setup guide (clone → `.env` → `mvn spring-boot:run` → frontend `npm install && npm start`)

---

## Phase 15 — Interview Preparation

Be ready to explain, unprompted and without notes:
- Why Weighted Average Cost over FIFO for V1, and how the Strategy pattern makes upgrading to FIFO a V2 addition, not a rewrite
- Why holdings are cached on `Asset` instead of recomputed per request, and how transactional integrity is preserved between the ledger and the cache
- Why transaction deletion was deliberately excluded from V1, using the multi-lot example as the concrete justification
- Why `PriceProvider` is an interface with only one implementation right now
- Why PostgreSQL over MongoDB for this data model
- Why `BigDecimal` is used throughout instead of `double`/`float`

---

## Summary: What's Explicitly Deferred to V2

Live market price feeds, FIFO cost-basis, corporate actions (dividends/splits/bonus/interest), additional asset classes, OAuth/refresh tokens/email verification/RBAC, CSV import, PDF/Excel export, notifications, immutable audit trail, transaction deletion/adjustment. All tracked as `v2-backlog` GitHub Issues — never silently cut.