# Project Plan

## Project Name

**PortSight – Portfolio Analytics Platform**

---

# 1. Problem Statement

Retail investors often track their investments using spreadsheets or multiple platforms, making it difficult to maintain accurate portfolio records and evaluate overall financial performance. Manual tracking is prone to calculation errors, inconsistent transaction histories, and limited analytical insights. Many basic tracking methods do not clearly distinguish realized profits from unrealized gains, enforce strict transaction validation, or maintain historical portfolio snapshots for long-term performance analysis. This project aims to provide a reliable, backend-driven portfolio analytics platform that ensures accurate financial calculations, secure transaction management, and meaningful investment insights.

---

# 2. Objectives

- **Accurate Financial Metrics:** Compute realized and unrealized profit/loss (P&L) using the **Weighted Average Cost (WAC)** accounting method.
* **Enforce Data Integrity:** Prevent invalid transactions such as overselling, negative quantities, and duplicate transaction entries.
* **Portfolio Analytics:** Generate portfolio valuation, allocation analysis, performance rankings, and historical growth insights.
* **Reliable API Design:** Develop secure, RESTful APIs following layered architecture and clean engineering practices.
* **Extensible Architecture:** Isolate the Analytics Engine and abstract market price acquisition through a provider interface to support future live market integrations.
* **Historical Tracking:** Automatically generate daily portfolio snapshots for long-term trend visualization.

---

# 3. Scope

## In Scope (MVP / V1)

* Portfolio management
* Asset management (Stocks and Mutual Funds only)
* BUY and SELL transaction management
* JWT-based authentication and authorization
* Portfolio Analytics Engine

    * Portfolio Valuation
    * Profit Engine
    * Allocation Engine
    * Performance Engine
    * Dashboard Aggregator
* Manual price updates through `ManualPriceProvider`
* Price abstraction using `PriceProvider`
* Nightly scheduled `PortfolioSnapshot` generation
* React dashboard for portfolio visualization

---

## Out of Scope (Future V2)

* Live market API integration (Yahoo Finance, Alpha Vantage, Polygon, etc.)
* Corporate actions

    * Dividends
    * Stock splits
    * Bonus shares
    * Interest calculations
* Additional asset classes

    * Crypto
    * Gold
    * Bonds
    * Fixed Deposits
    * Real Estate
    * Cash
* Email verification
* OAuth login
* Refresh Tokens
* Role-Based Access Control (RBAC)
* CSV imports
* PDF/Excel exports
* Audit logs
* Portfolio alerts and notifications

---

# 4. Assumptions

* All market prices are entered manually in V1.
* Each portfolio belongs to exactly one authenticated user.
* Every asset belongs to one portfolio.
* Every transaction belongs to one asset.
* Portfolio values are calculated using the latest manually entered prices.
* Currency used throughout the application is **INR**.
* Fractional quantities are supported where applicable.

---

# 5. Constraints

* Backend: Spring Boot
* Frontend: React
* Database: PostgreSQL
* Authentication: JWT
* Manual price updates only (V1)
* Internet connection required for deployment and usage
* Single-user portfolio ownership model

---

# 6. Design Decisions

## Cost-Basis Method

**Selected Method:** **Weighted Average Cost (WAC)**

The Portfolio Analytics Platform uses the **Weighted Average Cost (WAC)** method to calculate realized and unrealized profit/loss in the MVP (V1).

This method was selected because it provides a simpler and more maintainable implementation for an initial release. Instead of tracking individual purchase lots, the system maintains a single average purchase price for each asset, making BUY and SELL calculations straightforward while preserving financial accuracy.

Support for **FIFO (First-In, First-Out)** is planned as a future enhancement (V2), where individual purchase lots can be tracked through a strategy-based implementation without modifying the existing business logic.

# 7. Functional Requirements

## FR-1 Authentication

Users shall be able to register and log in securely using email and password.

The system shall issue a JWT after successful authentication.

---

## FR-2 Portfolio Management

Users shall be able to

* Create portfolios
* View portfolios
* Update portfolios
* Delete portfolios

Users shall only access portfolios that they own.

---

## FR-3 Asset Management

Users shall be able to

* Add Stocks
* Add Mutual Funds
* Edit assets
* Delete assets

---

## FR-4 Transaction Management

The system shall

* Record BUY transactions
* Record SELL transactions
* Reject negative quantities
* Prevent duplicate transactions
* Prevent selling more units than currently owned

---

## FR-5 Portfolio Analytics Engine

The system shall compute

### Portfolio Valuation

* Total Investment
* Current Portfolio Value
* Portfolio Return %
* Daily Change

### Profit Engine

* Realized Profit
* Unrealized Profit

using the **Weighted Average Cost (WAC)** method.
### Allocation Engine

* Asset allocation percentages
* Investment distribution

### Performance Engine

* Best performing asset
* Worst performing asset
* Largest investment
* Highest gain

### Dashboard Aggregator

Aggregate all analytics into a single response for dashboard visualization.

---

## FR-6 Historical Snapshots

A scheduled nightly job shall generate a `PortfolioSnapshot` containing

* Portfolio value
* Total investment
* Profit/Loss
* Snapshot date

---

## FR-7 Price Management

Market prices shall be updated using a `ManualPriceProvider` implementation operating behind the `PriceProvider` abstraction.

---

## FR-8 REST APIs

The system shall expose RESTful APIs for all supported operations.

---

## FR-9 Request Validation

The system shall validate all incoming requests before executing business logic.

---

# 8. Non-Functional Requirements

## Data Precision & Consistency

* Financial calculations shall use `BigDecimal`.
* Database operations shall maintain ACID compliance.
* All transaction processing shall preserve data consistency.

---

## Security

* Passwords shall be encrypted using BCrypt.
* Protected endpoints shall require JWT authentication.
* Secrets shall never be committed to source control.
* Environment variables shall store sensitive configuration.

---

## Performance

* Dashboard APIs should return results efficiently for normal portfolio sizes.
* Database queries should minimize unnecessary joins and redundant calculations.

---

## Reliability

* Scheduled snapshot generation shall avoid duplicate daily records.
* Transaction validation shall prevent inconsistent portfolio states.

---

## Maintainability

The application shall follow a layered architecture.

```text
Controller
    ↓
Service
    ↓
Analytics Engine
    ↓
Repository
    ↓
PostgreSQL
```

Business logic shall remain isolated from presentation logic.

---

## Extensibility

The market pricing module shall be abstracted using the `PriceProvider` interface so that live providers can be integrated without changing business logic.

---

## Database Evolution

Database schema changes shall be version controlled using Flyway or Liquibase migration scripts.

---

## Logging

Application events and unexpected failures shall be recorded using structured logging.

---


# 9. Success Criteria

The MVP shall be considered complete when

* User authentication works successfully.
* Portfolio CRUD operations are functional.
* Asset CRUD operations are functional.
* BUY and SELL validation rules are enforced.
* Analytics Engine calculations match manually verified results.
* Dashboard displays valuation, allocation, performance, and historical growth.
* Nightly snapshot scheduler executes successfully.
* Backend and frontend are deployed successfully.
* Project documentation is complete.
* Source code is available in a public GitHub repository.
* Profit calculations using the Weighted Average Cost (WAC) method match manually verified test cases.
---

# 10. Glossary

| Term               | Definition                                                                         |
| ------------------ | ---------------------------------------------------------------------------------- |
| Portfolio          | A collection of investment assets owned by a user.                                 |
| Asset              | A financial instrument such as a Stock or Mutual Fund.                             |
| Transaction        | A BUY or SELL operation performed on an asset.                                     |
| Portfolio Value    | Total current market value of all holdings.                                        |
| Realized Profit    | Profit earned from assets that have been sold.                                     |
| Unrealized Profit  | Profit or loss on assets currently held.                                           |
| Portfolio Snapshot | A daily stored record used for historical growth visualization.                    |
| Analytics Engine   | The backend module responsible for financial calculations and dashboard analytics. |

---

# 11. MVP (V1) vs Future Scope (V2)

| Feature              | MVP (V1)                | Future Scope (V2)                                        |
| -------------------- | ----------------------- |----------------------------------------------------------|
| Supported Assets     | Stocks and Mutual Funds | Crypto, Gold, Bonds, Real Estate, Fixed Deposits, Cash   |
| Transactions         | BUY and SELL            | Dividends, Bonus Shares, Stock Splits, Interest          |
| Price Source         | ManualPriceProvider     | Live Market APIs (Yahoo Finance, Alpha Vantage, Polygon) |
| Authentication       | Email/Password + JWT    | OAuth, Refresh Tokens, Email Verification, RBAC          |
| Data Import          | Manual Entry            | CSV/Broker Statement Import                              |
| Data Export          | Not Supported           | PDF and Excel Export                                     |
| Historical Snapshots | Nightly Snapshot        | Weekly, Monthly, Custom Intervals                        |
| Notifications        | Not Supported           | Price Alerts, Rebalancing Alerts                         |
| Audit Logs           | Basic Application Logs  | Immutable Audit Trail                                    |
| Asset Coverage       | Limited                 | Multiple Investment Categories                           |
| Cost-Basis Method    | Weighted Average Cost (WAC)| FIFO and additional accounting strategies                |

---

# 12
. Technology Stack

## Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* PostgreSQL
* Flyway (or Liquibase)
* JWT
* Maven

---

## Frontend

* React
* Tailwind CSS
* Axios
* React Router
* Recharts

---

## DevOps & Tools

* Docker
* Git
* GitHub
* Postman
* IntelliJ IDEA
* VS Code

---

## Testing

* JUnit 5
* Mockito
* Postman API Testing

---

**Document Version:** 1.0
**Status:** Planning Phase
