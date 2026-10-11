import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
} from '../utils/formatters';

export const PortfolioDetail = () => {
  const { id } = useParams();

  const totalValue = 0;
  const unrealizedProfit = 0;
  const returnPct = 0;
  const portfolioAssets = [];

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            to="/portfolios"
            className="text-xs text-accent hover:underline mb-2 inline-block"
          >
            ← Back to portfolios
          </Link>

          <div className="flex items-center justify-between gap-4 pb-6 border-b border-rule">
            <div>
              <h1 className="text-xl font-semibold text-ink tracking-tight">
                Portfolio #{id}
              </h1>
              <p className="text-sm text-muted mt-0.5">
                Assets and holdings breakdown
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="bg-surface text-ink border border-rule text-sm font-medium px-3.5 py-1.5 rounded-sm hover:bg-slate-50 transition-colors"
              >
                View dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Portfolio Summary Row */}
        <section className="mb-8">
          <span className="font-serif text-3xl sm:text-4xl text-ink tabular-nums tracking-tight block">
            {formatCurrency(totalValue)}
          </span>
          <p className="text-sm text-muted mt-1">
            Overall return{' '}
            <span className="tabular-nums">
              {formatSignedCurrency(unrealizedProfit)} (
              {formatSignedPercent(returnPct)})
            </span>
          </p>
        </section>

        {/* Asset Holdings Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">
              Asset holdings
            </h2>
            <span className="text-xs text-muted tabular-nums">
              0 assets
            </span>
          </div>

          {portfolioAssets.length === 0 ? (
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
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PortfolioDetail;
