# PortSight — Testing & Deployment Guide

**Document Version:** 1.0
**Companion to:** `01_Project_Plan.md`, `02_System_Design.md`, `03_Implementation.md`
**Covers:** Phase 11 (Testing) and Phase 12 (Deployment) in full detail.

---

# PART A — TESTING

## A.1 Testing Strategy Overview

| Layer | Tool | What it covers |
|---|---|---|
| Analytics Engine | JUnit 5 | Pure business logic, no Spring context needed |
| Service layer | JUnit 5 + Mockito | Validation rules, mocked repositories |
| Repository layer | Spring Data JPA test slice (`@DataJpaTest`) | Query correctness against a real (test) database |
| Full API | Postman / `MockMvc` integration tests | End-to-end request → response behavior |

**Priority order:** Analytics Engine first (highest risk of silent correctness bugs), then Transaction validation, then everything else. A bug in a CRUD endpoint is obvious the first time you click it; a bug in average-buy-price calculation can sit unnoticed for weeks.

---

## A.2 Analytics Engine Tests (highest priority)

Write these **before** implementing the engine, per the Phase 8 note in the Implementation Guide.

### Example test scenarios to hand-calculate first

| # | Scenario | Expected result |
|---|---|---|
| 1 | BUY 100 @ ₹100 | avgBuyPrice = 100, quantityHeld = 100 |
| 2 | + BUY 50 @ ₹120 | avgBuyPrice = (100×100 + 50×120) / 150 = ₹106.67, quantityHeld = 150 |
| 3 | + SELL 80 @ ₹130 | realizedProfit = 80 × (130 − 106.67) = ₹1,866.40; quantityHeld = 70; avgBuyPrice unchanged (WAC: SELL doesn't move the average) |
| 4 | Current price ₹150, remaining 70 units | unrealizedProfit = 70 × (150 − 106.67) = ₹3,033.10 |
| 5 | SELL exactly remaining quantityHeld | Succeeds, quantityHeld → 0 |
| 6 | SELL 1 unit more than quantityHeld | Rejected with `InsufficientHoldingsException` |

### Example JUnit test skeleton

```java
@Test
void weightedAveragePrice_afterMultipleBuys_isCorrect() {
    CostBasisStrategy strategy = new WeightedAverageCostStrategy();

    BigDecimal avgPrice = strategy.calculateAverageBuyPrice(
        List.of(
            new TransactionRecord(BUY, new BigDecimal("100"), new BigDecimal("100")),
            new TransactionRecord(BUY, new BigDecimal("50"), new BigDecimal("120"))
        )
    );

    assertEquals(0, avgPrice.compareTo(new BigDecimal("106.67")));
}
```

**Note:** always compare `BigDecimal` with `.compareTo()`, never `.equals()` — `equals()` treats `100.0` and `100.00` as different values due to scale, which will cause confusing false test failures.

### What to unit test in each engine

- **ValuationEngine:** total investment, current value, return % — across zero holdings, single-asset, and multi-asset portfolios
- **ProfitEngine:** realized profit on partial sells, unrealized profit at various current prices, a portfolio with only BUYs (no realized profit yet)
- **AllocationEngine:** percentages sum to 100% (within rounding tolerance) across 1, 2, and 5+ assets
- **PerformanceEngine:** correct best/worst performer when gains are equal (tie-breaking behavior should be defined, not accidental)

---

## A.3 Service Layer Tests (Mockito)

Mock the repository layer; test only the service's own logic.

```java
@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private AssetRepository assetRepository;
    @InjectMocks private TransactionService transactionService;

    @Test
    void sell_moreThanHoldings_throwsException() {
        Asset asset = new Asset();
        asset.setQuantityHeld(new BigDecimal("50"));
        when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));

        TransactionRequest request = new TransactionRequest(SELL, new BigDecimal("51"), new BigDecimal("100"));

        assertThrows(InsufficientHoldingsException.class,
            () -> transactionService.recordTransaction(1L, request));
    }
}
```

**Required service-layer test cases:**
- Reject negative or zero quantity
- Reject negative or zero price
- Reject SELL exceeding `quantityHeld`
- Reject a duplicate transaction submitted twice in immediate succession
- Confirm `Asset` cache (`quantityHeld`, `avgBuyPrice`) updates correctly after a successful BUY/SELL
- Confirm portfolio ownership check rejects access to another user's portfolio/asset

---

## A.4 Concurrency Test

Since Architecture Decision 8.1 calls out the race condition explicitly, write at least one test that proves the fix works:

```java
@Test
void concurrentSells_onlyOneSucceedsWhenInsufficientHoldings() throws InterruptedException {
    // Asset has quantityHeld = 10
    // Fire two SELL(6) requests concurrently
    // Assert exactly one succeeds and one throws InsufficientHoldingsException
}
```

Use `ExecutorService` with two threads and a `CountDownLatch` to fire both requests as close to simultaneously as possible, then assert on the outcome and the final `quantityHeld`.

---

## A.5 Integration Tests

Use `@SpringBootTest` + `MockMvc` (or `@DataJpaTest` for repository-only checks) against a real test database — **Testcontainers with a PostgreSQL container is the strongest setup**, since it exercises the same database engine as production rather than an in-memory substitute.

```java
@SpringBootTest
@Testcontainers
class TransactionIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void configureProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    // full request -> DB -> response tests here
}
```

If Testcontainers feels like too much setup time right now, an H2 in-memory database is an acceptable fallback for V1 — just note in the README that production uses PostgreSQL and integration tests currently run against H2, so it's a stated tradeoff rather than an unstated gap.

---

## A.6 Postman Collection

Structure one Postman collection with a folder per module, matching the API Overview:

```
PortSight.postman_collection.json
├── Auth/
│   ├── Register
│   └── Login (saves JWT to a collection variable)
├── Portfolio/ (CRUD)
├── Asset/ (CRUD + price update)
├── Transaction/ (create + list)
└── Analytics/ (valuation, profit, allocation, performance, dashboard)
```

Use a Postman **environment variable** for the JWT so every subsequent request auto-attaches `Authorization: Bearer {{token}}` after login. Export the collection and commit it to `postman/` in the repo — this becomes a one-click way for anyone (including an interviewer) to exercise the whole API.

---

## A.7 Testing Exit Checklist

- [ ] All hand-calculated Analytics Engine scenarios pass
- [ ] Service layer validation rules fully covered (overselling, negative values, duplicates)
- [ ] Concurrency test passes consistently (run it 10+ times — race conditions can pass by luck once)
- [ ] Integration tests run against a real or containerized PostgreSQL instance
- [ ] Postman collection covers all ~20 endpoints and is committed to the repo
- [ ] No `double`/`float` used anywhere in money-related test assertions

---

# PART B — DEPLOYMENT

## B.1 Deployment Architecture

```
GitHub repo
   │
   ├── backend/  → Docker image → Render or Railway (+ managed PostgreSQL)
   └── frontend/ → Vercel or Netlify (static build, points to backend URL)
```

## B.2 Dockerizing the Backend

`Dockerfile` (multi-stage, keeps the final image small):

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Test locally before deploying:
```bash
docker build -t portsight-backend .
docker run -p 8080:8080 --env-file .env portsight-backend
```

## B.3 Backend + Database Deployment (Render or Railway)

Both platforms follow the same shape:

1. Provision a managed PostgreSQL instance first — copy its connection URL, username, password
2. Create a new Web Service from your GitHub repo (auto-builds from the `Dockerfile`)
3. Set environment variables in the platform's dashboard, **not in code**:
    - `DB_USERNAME`, `DB_PASSWORD` (from the managed database)
    - `SPRING_DATASOURCE_URL` (the managed database's JDBC URL)
    - `JWT_SECRET` (a long random string, different from your local dev value)
4. Deploy — Flyway should run automatically on startup and create the schema against the fresh production database
5. Confirm `/swagger-ui.html` is reachable at the deployed URL and hitting `/api/auth/register` works end-to-end

## B.4 Frontend Deployment (Vercel or Netlify)

1. Set the build command (`npm run build`) and output directory (`dist` or `build`, depending on your React setup)
2. Add an environment variable for the backend's base URL, e.g. `VITE_API_BASE_URL=https://portsight-backend.onrender.com`
3. Update `api/axiosInstance.js` to read this env variable instead of hardcoding `localhost:8080`
4. Deploy — confirm the deployed frontend can actually reach the deployed backend (check the browser console for CORS errors)

## B.5 CORS Configuration (a common first-deploy failure point)

In `SecurityConfig.java`, explicitly allow the deployed frontend's origin:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:5173",                     // local dev
        "https://portsight.vercel.app"                // deployed frontend
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

Wildcard origins (`*`) will silently break JWT-authenticated requests in most browsers — list the exact deployed frontend URL instead.

## B.6 Secrets Checklist (re-confirm before going live)

- [ ] `JWT_SECRET` used in production is different from the one in your local `.env`
- [ ] No secret appears anywhere in `application.yml` as a literal value — only `${ENV_VAR}` references
- [ ] `.env` is confirmed absent from the GitHub repo (`git log --all --full-history -- .env` should return nothing)
- [ ] Database credentials are only ever pasted into the hosting platform's dashboard, never into a commit

## B.7 Post-Deployment Verification

- [ ] Full user flow works on the live URL: register → login → create portfolio → add asset → BUY/SELL → dashboard renders correctly
- [ ] Nightly `PortfolioSnapshotJob` fires on the deployed instance (check platform logs the next day, or trigger manually once to confirm it doesn't error)
- [ ] Swagger UI is reachable and reflects the live API
- [ ] README updated with the live demo link

---

## B.8 Optional: CI Pipeline (GitHub Actions)

Not required for V1, but a strong addition if time allows — a `.github/workflows/ci.yml` that runs `mvn test` on every push/PR gives you a green checkmark on every commit in your GitHub history, which is a small but real signal to anyone reviewing the repo.

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - run: mvn test
```