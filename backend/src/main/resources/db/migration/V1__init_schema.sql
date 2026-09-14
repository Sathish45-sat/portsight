CREATE TABLE users (
     id BIGSERIAL PRIMARY KEY,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE portfolios (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE RESTRICT,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('STOCK','MUTUAL_FUND')),
    current_price NUMERIC(18,4) NOT NULL,
    avg_buy_price NUMERIC(18,4) NOT NULL DEFAULT 0,
    quantity_held NUMERIC(18,6) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (portfolio_id, symbol)
);

CREATE TABLE transactions (
     id BIGSERIAL PRIMARY KEY,
     asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
     transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('BUY','SELL')),
     quantity NUMERIC(18,6) NOT NULL CHECK (quantity > 0),
     price_per_unit NUMERIC(18,4) NOT NULL CHECK (price_per_unit > 0),
     transaction_date TIMESTAMP NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE portfolio_snapshots (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    total_investment NUMERIC(18,4) NOT NULL,
    current_value NUMERIC(18,4) NOT NULL,
    profit_loss NUMERIC(18,4) NOT NULL,
    snapshot_date DATE NOT NULL,
    UNIQUE (portfolio_id, snapshot_date)
);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_assets_portfolio_id ON assets(portfolio_id);
CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_snapshots_portfolio_id ON portfolio_snapshots(portfolio_id);