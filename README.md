# PortSight — Portfolio Analytics Platform

PortSight is a full-stack portfolio analytics and management platform that tracks investments across stocks and mutual funds, calculates real-time valuations, Weighted Average Cost (WAC) profit and loss, allocation distributions, and performance metrics.

---

## Architecture Overview

- **Backend:** Spring Boot 3.x, Java 21, Spring Security (Stateless JWT), Spring Data JPA, PostgreSQL, Flyway migrations.
- **Frontend:** React 19, Vite, Tailwind CSS v4, Axios, React Router v7, Recharts.
- **Analytics Engine:** Isolated financial calculations (Valuation, WAC Profit/Loss, Allocation, Performance, Snapshots).

---

## Design Decisions

1. **Token Storage (JWT in `localStorage` vs. `httpOnly` Cookies):**
   - For V1, the JWT authentication token is stored in `localStorage` for simplicity of client-side request interception and state handling. We acknowledge that storing tokens in `localStorage` is susceptible to Cross-Site Scripting (XSS) attacks, and utilizing `httpOnly`, `Secure`, `SameSite` cookies with CSRF protection is the industry alternative targeted for hardened production deployments.
2. **Cached Holdings on Asset Entity:**
   - `quantityHeld` and `avgBuyPrice` are cached on the `Asset` entity and updated transactionally on BUY/SELL transactions to provide $O(1)$ dashboard reads.
3. **Append-Only Transactions (V1):**
   - Transactions are strictly append-only in V1 to maintain historical consistency and deterministic Weighted Average Cost calculations.
4. **Optimistic Locking:**
   - `@Version` concurrency control on `Asset` prevents oversell race conditions during concurrent SELL executions.
5. **Strict CORS Policy:**
   - Explicitly restricted to `http://localhost:5173` without wildcards for enhanced security during local development.

---

## Project Structure

```
├── backend/          # Spring Boot Application (Port 8080)
│   ├── src/main/java/com/portsight/
│   │   ├── analytics/    # Financial valuation & profit engines
│   │   ├── config/       # Security & CORS configuration
│   │   ├── controller/   # REST controllers
│   │   ├── dto/          # Request & response DTOs
│   │   ├── entity/       # JPA entities
│   │   ├── repository/   # Spring Data JPA repositories
│   │   ├── security/     # JWT authentication & filters
│   │   └── service/      # Orchestration & business logic
│   └── src/main/resources/
│       ├── db/migration/ # Flyway SQL migrations
│       └── application.yml
├── frontend/         # Vite + React Application (Port 5173)
│   ├── src/
│   │   ├── api/          # Axios instance & API client modules
│   │   ├── components/   # UI components
│   │   ├── context/      # React contexts (Auth, Portfolio)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Route page views
│   │   ├── routes/       # React Router setup & protected routes
│   │   └── utils/        # Formatting and financial utility helpers
│   ├── .env.example
│   └── vite.config.js
└── docs/             # System design & architecture specifications
```

---

## Getting Started

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`.

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.
