import { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
} from '../utils/formatters';

export const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [holdings] = useState([]);
  const [snapshots] = useState([]);
  const [allocations] = useState([]);

  // Empty / initial baseline metrics
  const totalValue = 0;
  const todayChangeAmount = 0;
  const todayChangePct = 0;
  const overallReturnAmount = 0;
  const overallReturnPct = 0;
  const realizedProfit = 0;
  const unrealizedProfit = 0;

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* 1. Header row: portfolio name on the left, "Add transaction" button on the right */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-rule">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Portfolio valuation and performance analytics
            </p>
          </div>

          <button
            id="add-transaction-button"
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-surface text-sm font-medium px-3.5 py-2 rounded-sm hover:opacity-95 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
          >
            Add transaction
          </button>
        </div>

        {/* 2 & 3. Portfolio Total + Today's Change + Overall Return + Quiet Line */}
        <section className="pt-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:flex-wrap gap-x-6 gap-y-2">
            <span
              id="portfolio-total-value"
              className="font-serif text-4xl sm:text-5xl text-ink tabular-nums tracking-tight"
            >
              {formatCurrency(totalValue)}
            </span>

            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-muted">
                Today{' '}
                <span className="tabular-nums">
                  {formatSignedCurrency(todayChangeAmount)} (
                  {formatSignedPercent(todayChangePct)})
                </span>
              </span>

              <span className="text-muted">
                Overall{' '}
                <span className="tabular-nums">
                  {formatSignedCurrency(overallReturnAmount)} (
                  {formatSignedPercent(overallReturnPct)})
                </span>
              </span>
            </div>
          </div>

          {/* 3. Single quiet line under it: "Realized ₹X · Unrealized ₹Y" */}
          <p className="text-sm text-muted mt-2">
            Realized {formatCurrency(realizedProfit)} · Unrealized{' '}
            {formatCurrency(unrealizedProfit)}
          </p>
        </section>

        {/* 4. Full-width growth line chart */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">
              Growth trend
            </h2>
            <span className="text-xs text-muted">
              Last 30 days
            </span>
          </div>

          <div className="w-full h-48 border border-rule bg-surface p-4 flex items-center justify-center">
            {snapshots.length === 0 ? (
              <p className="text-sm text-muted">
                No growth data yet. Add transactions to see performance over time.
              </p>
            ) : null}
          </div>
        </section>

        {/* 5. Allocation as ONE horizontal stacked bar */}
        <section className="pb-10">
          <h2 className="text-sm font-semibold text-ink mb-3">
            Asset allocation
          </h2>

          {allocations.length === 0 ? (
            <div className="w-full border border-rule p-4 text-center">
              <p className="text-sm text-muted">
                No asset allocation yet.
              </p>
            </div>
          ) : (
            <>
              <div className="w-full h-3.5 flex overflow-hidden border border-rule">
                {allocations.map((segment) => (
                  <div
                    key={segment.key}
                    style={{
                      width: `${segment.percentage}%`,
                      backgroundColor: segment.color,
                    }}
                    title={`${segment.name}: ${segment.percentage}%`}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-xs text-muted">
                {allocations.map((segment) => (
                  <div key={segment.key} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 inline-block shrink-0"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-ink">{segment.name}</span>
                    <span className="tabular-nums text-muted">
                      {segment.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* 6. Holdings table */}
        <section className="pb-12">
          <h2 className="text-sm font-semibold text-ink mb-3">
            Holdings
          </h2>

          {holdings.length === 0 ? (
            <div className="p-8 border border-rule text-center">
              <p className="text-sm text-muted">
                No assets yet. Add one to start tracking.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-rule">
              <table className="w-full text-left text-sm border-collapse rounded-none">
                <thead>
                  <tr className="border-b border-rule bg-surface text-xs text-muted">
                    <th className="py-2.5 px-3 font-medium">Asset</th>
                    <th className="py-2.5 px-3 font-medium text-right">Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Avg cost</th>
                    <th className="py-2.5 px-3 font-medium text-right">Price</th>
                    <th className="py-2.5 px-3 font-medium text-right">Value</th>
                    <th className="py-2.5 px-3 font-medium text-right">Unrealized</th>
                    <th className="py-2.5 px-3 font-medium text-right">Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule bg-surface text-ink">
                  {/* Populated when holdings exist */}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add Transaction Dialog */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-ink/30 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface border border-rule w-full max-w-sm p-6 rounded-sm shadow-sm">
            <h3 className="text-base font-semibold text-ink mb-1">
              Add transaction
            </h3>
            <p className="text-xs text-muted mb-4">
              Record a buy or sell trade for your portfolio.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs text-ink mb-1" htmlFor="asset-symbol">
                  Asset symbol
                </label>
                <input
                  id="asset-symbol"
                  type="text"
                  placeholder="e.g. INFY or HDFCBANK"
                  className="w-full border border-rule bg-surface rounded-sm px-2.5 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-ink mb-1" htmlFor="trade-type">
                  Transaction type
                </label>
                <select
                  id="trade-type"
                  className="w-full border border-rule bg-surface rounded-sm px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-ink mb-1" htmlFor="trade-qty">
                  Quantity
                </label>
                <input
                  id="trade-qty"
                  type="number"
                  step="any"
                  placeholder="0"
                  className="w-full border border-rule bg-surface rounded-sm px-2.5 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-ink mb-1" htmlFor="trade-price">
                  Price per unit (₹)
                </label>
                <input
                  id="trade-price"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="w-full border border-rule bg-surface rounded-sm px-2.5 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent tabular-nums"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm text-muted hover:text-ink px-3 py-1.5 border border-rule rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent text-surface text-sm font-medium px-3.5 py-1.5 rounded-sm hover:opacity-95 cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
                >
                  Add transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
