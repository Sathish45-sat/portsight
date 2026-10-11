import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatCurrency, formatSignedPercent } from '../utils/formatters';

export const Portfolios = () => {
  const [portfolios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-rule mb-8">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">
              Portfolios
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Manage and track your distinct investment portfolios.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-surface text-sm font-medium px-3.5 py-2 rounded-sm hover:opacity-95 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
          >
            Create portfolio
          </button>
        </div>

        {portfolios.length === 0 ? (
          <div className="p-8 border border-rule text-center">
            <p className="text-sm text-muted">
              No portfolios yet. Create one to start tracking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-rule">
            <table className="w-full text-left text-sm border-collapse rounded-none">
              <thead>
                <tr className="border-b border-rule bg-surface text-xs text-muted">
                  <th className="py-2.5 px-3 font-medium">Portfolio</th>
                  <th className="py-2.5 px-3 font-medium text-right">Assets</th>
                  <th className="py-2.5 px-3 font-medium text-right">Value</th>
                  <th className="py-2.5 px-3 font-medium text-right">Unrealized</th>
                  <th className="py-2.5 px-3 font-medium text-right">Return</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule bg-surface text-ink">
                {portfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <Link
                        to={`/portfolios/${portfolio.id}`}
                        className="font-medium text-ink hover:text-accent hover:underline block"
                      >
                        {portfolio.name}
                      </Link>
                      <span className="text-xs text-muted block">
                        {portfolio.description}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums text-muted">
                      {portfolio.assetCount}
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums font-medium">
                      {formatCurrency(portfolio.totalValue)}
                    </td>

                    <td
                      className={`py-3 px-3 text-right tabular-nums ${
                        portfolio.unrealizedProfit >= 0 ? 'text-gain' : 'text-loss'
                      }`}
                    >
                      {portfolio.unrealizedProfit >= 0 ? '+' : '−'}
                      {formatCurrency(Math.abs(portfolio.unrealizedProfit))}
                    </td>

                    <td
                      className={`py-3 px-3 text-right tabular-nums ${
                        portfolio.returnPct >= 0 ? 'text-gain' : 'text-loss'
                      }`}
                    >
                      {formatSignedPercent(portfolio.returnPct)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/dashboard"
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        View dashboard
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create Portfolio Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-ink/30 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface border border-rule w-full max-w-sm p-6 rounded-sm shadow-sm">
            <h3 className="text-base font-semibold text-ink mb-1">
              Create portfolio
            </h3>
            <p className="text-xs text-muted mb-4">
              Create a container to track assets and calculate analytics.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs text-ink mb-1" htmlFor="portfolio-name">
                  Portfolio name
                </label>
                <input
                  id="portfolio-name"
                  type="text"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  placeholder="e.g. Long-term Growth"
                  className="w-full border border-rule bg-surface rounded-sm px-2.5 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-ink mb-1" htmlFor="portfolio-desc">
                  Description
                </label>
                <input
                  id="portfolio-desc"
                  type="text"
                  value={newPortfolioDesc}
                  onChange={(e) => setNewPortfolioDesc(e.target.value)}
                  placeholder="e.g. Equities and debt funds"
                  className="w-full border border-rule bg-surface rounded-sm px-2.5 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
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
                  Create portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolios;
