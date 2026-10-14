import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Navbar from '../components/Navbar';
import useDashboard from '../hooks/useDashboard';
import portfolioApi from '../api/portfolioApi';
import {
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
  formatQuantity,
} from '../utils/formatters';

const ALLOCATION_PALETTE = [
  '#0f172a', // Slate 900
  '#334155', // Slate 700
  '#475569', // Slate 600
  '#64748b', // Slate 500
  '#94a3b8', // Slate 400
  '#cbd5e1', // Slate 300
  '#3b82f6', // Blue 500
  '#60a5fa', // Blue 400
  '#818cf8', // Indigo 400
  '#a5b4fc', // Indigo 300
];

const formatSnapshotDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = String(dateStr).split('-').map(Number);
    if (!year || !month || !day) return String(dateStr);
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return String(dateStr);
  }
};

export const Dashboard = () => {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('portfolioId');

  const [portfolios, setPortfolios] = useState([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(
    routeId || queryId || null
  );

  // Load portfolios list to resolve default portfolio if none specified in URL
  useEffect(() => {
    let isMounted = true;
    const loadPortfolios = async () => {
      setPortfoliosLoading(true);
      try {
        const list = await portfolioApi.getAll();
        if (isMounted) {
          const arr = Array.isArray(list) ? list : [];
          setPortfolios(arr);
          if (!selectedPortfolioId && arr.length > 0) {
            setSelectedPortfolioId(String(arr[0].id));
          }
        }
      } catch {
        if (isMounted) {
          setPortfolios([]);
        }
      } finally {
        if (isMounted) {
          setPortfoliosLoading(false);
        }
      }
    };

    loadPortfolios();
    return () => {
      isMounted = false;
    };
  }, [selectedPortfolioId]);

  // Sync state if URL changes
  useEffect(() => {
    if (routeId) setSelectedPortfolioId(routeId);
    else if (queryId) setSelectedPortfolioId(queryId);
  }, [routeId, queryId]);

  const { data, loading, error, refetch } = useDashboard(selectedPortfolioId);

  // Safe metrics extraction
  const totalValue = data?.totalPortfolioValue != null ? Number(data.totalPortfolioValue) : 0;
  const dailyChangeAmount = data?.dailyChange != null ? Number(data.dailyChange) : null;
  const dailyChangePct = data?.dailyChangePercentage != null ? Number(data.dailyChangePercentage) : null;
  const overallReturnAmount = data?.totalProfit != null ? Number(data.totalProfit) : 0;
  const overallReturnPct = data?.totalReturnPercentage != null ? Number(data.totalReturnPercentage) : 0;
  const realizedProfit = data?.totalRealizedProfit != null ? Number(data.totalRealizedProfit) : 0;
  const unrealizedProfit = data?.totalUnrealizedProfit != null ? Number(data.totalUnrealizedProfit) : 0;

  const allocations = Array.isArray(data?.allocations) ? data.allocations : [];
  const holdings = Array.isArray(data?.holdings) ? data.holdings : [];
  const snapshots = Array.isArray(data?.recentSnapshots) ? data.recentSnapshots : [];

  const bestPerformerSymbol = data?.bestPerformer?.symbol;
  const worstPerformerSymbol = data?.worstPerformer?.symbol;

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            to={selectedPortfolioId ? `/portfolios/${selectedPortfolioId}` : '/portfolios'}
            className="text-xs text-accent hover:underline mb-2 inline-block cursor-pointer"
          >
            ← Back to portfolio detail
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-rule">
            <div>
              <h1 id="dashboard-title" className="text-xl font-semibold text-ink tracking-tight">
                {data?.portfolioName ? `${data.portfolioName} · Dashboard` : 'Dashboard'}
              </h1>
              <p className="text-sm text-muted mt-0.5">
                Valuation, return breakdown, asset allocation, and performance history
              </p>
            </div>

            <div className="flex items-center gap-3">
              {portfolios.length > 1 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="portfolio-select" className="text-xs text-muted">
                    Portfolio:
                  </label>
                  <select
                    id="portfolio-select"
                    value={selectedPortfolioId || ''}
                    onChange={(e) => setSelectedPortfolioId(e.target.value)}
                    className="border border-rule bg-surface text-xs text-ink rounded-sm px-2.5 py-1.5 focus:outline-none focus:border-accent"
                  >
                    {portfolios.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedPortfolioId && (
                <Link
                  to={`/portfolios/${selectedPortfolioId}`}
                  className="bg-surface text-ink border border-rule text-sm font-medium px-3.5 py-1.5 rounded-sm hover:bg-slate-50 transition-colors"
                >
                  Manage assets
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Global Loading State */}
        {(loading || portfoliosLoading) && (
          <div id="dashboard-loading" className="p-16 border border-rule text-center my-6">
            <p className="text-sm text-muted">Loading dashboard analytics...</p>
          </div>
        )}

        {/* Global Error State with Retry Button */}
        {!loading && !portfoliosLoading && error && (
          <div id="dashboard-error" className="p-8 border border-loss/40 text-center space-y-3 my-6">
            <p className="text-sm text-loss font-mono">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="text-xs text-accent hover:underline font-medium cursor-pointer"
            >
              Retry loading dashboard
            </button>
          </div>
        )}

        {/* Empty State: No portfolios exist */}
        {!loading && !portfoliosLoading && !error && portfolios.length === 0 && (
          <div id="no-portfolios-state" className="p-16 border border-rule text-center space-y-3 my-6">
            <p className="text-sm text-muted">
              No portfolios yet. Create one to view dashboard analytics.
            </p>
            <Link
              to="/portfolios"
              className="inline-block text-xs text-accent hover:underline font-medium cursor-pointer"
            >
              Go to Portfolios
            </Link>
          </div>
        )}

        {/* Loaded Dashboard Content */}
        {!loading && !portfoliosLoading && !error && data && (
          <div className="space-y-10">
            {/* Header Block: Total Value + Today's Change + Overall Return + Quiet Line */}
            <section id="dashboard-headline" className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:flex-wrap gap-x-6 gap-y-2">
                <span
                  id="portfolio-total-value"
                  className="font-serif text-4xl sm:text-5xl text-ink tabular-nums tracking-tight"
                >
                  {formatCurrency(totalValue)}
                </span>

                <div className="flex items-center gap-4 text-sm font-medium">
                  {/* Today's Change: Empty until 2 snapshots exist. Show "—" instead of ₹0.00 */}
                  <span id="today-change-display" className="text-muted">
                    Today{' '}
                    {snapshots.length < 2 || dailyChangeAmount == null || dailyChangePct == null ? (
                      <span className="tabular-nums font-normal text-muted">—</span>
                    ) : (
                      <span className="tabular-nums">
                        {formatSignedCurrency(dailyChangeAmount)} ({formatSignedPercent(dailyChangePct)})
                      </span>
                    )}
                  </span>

                  {/* Overall Return */}
                  <span id="overall-return-display" className="text-muted">
                    Overall{' '}
                    <span className="tabular-nums">
                      {formatSignedCurrency(overallReturnAmount)} ({formatSignedPercent(overallReturnPct)})
                    </span>
                  </span>
                </div>
              </div>

              {/* Single quiet line: Realized ₹X · Unrealized ₹Y */}
              <p id="profit-quiet-line" className="text-sm text-muted mt-2">
                Realized {formatCurrency(realizedProfit)} · Unrealized{' '}
                {formatCurrency(unrealizedProfit)}
              </p>
            </section>

            {/* Growth Chart (Recharts LineChart) */}
            <section id="growth-chart-section">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink">
                  Growth trend
                </h2>
                <span className="text-xs text-muted">
                  Historical portfolio valuation
                </span>
              </div>

              <div className="w-full h-64 sm:h-72 border border-rule bg-surface p-4 flex items-center justify-center">
                {snapshots.length === 0 ? (
                  <p id="chart-zero-snapshots-msg" className="text-xs text-muted text-center">
                    History appears after the first nightly snapshot
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={snapshots}
                      margin={{ top: 12, right: 16, left: 16, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="snapshotDate"
                        tickFormatter={formatSnapshotDate}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={{ stroke: '#cbd5e1' }}
                        width={80}
                      />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Portfolio Value']}
                        labelFormatter={formatSnapshotDate}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '2px',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="currentValue"
                        stroke="#0f172a"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#0f172a' }}
                        activeDot={{ r: 5, fill: '#0f172a' }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* Allocation Bar (Plain divs with widths from allocation percentages) */}
            <section id="allocation-section">
              <h2 className="text-sm font-semibold text-ink mb-3">
                Asset allocation
              </h2>

              {allocations.length === 0 ? (
                <div id="allocation-empty" className="w-full border border-rule p-6 text-center">
                  <p className="text-xs text-muted">
                    No asset allocation yet.
                  </p>
                </div>
              ) : (
                <div className="border border-rule bg-surface p-4 rounded-sm">
                  {/* Horizontal Stacked Bar */}
                  <div
                    id="allocation-bar"
                    className="w-full h-4 flex overflow-hidden border border-rule rounded-xs bg-slate-100"
                  >
                    {allocations.map((alloc, idx) => {
                      const pct = Math.max(0, Number(alloc.allocationPercentage || 0));
                      const color = ALLOCATION_PALETTE[idx % ALLOCATION_PALETTE.length];
                      return (
                        <div
                          key={alloc.assetId || alloc.symbol}
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                            minWidth: pct > 0 ? '4px' : '0px',
                          }}
                          title={`${alloc.symbol} (${alloc.name}): ${pct.toFixed(2)}%`}
                        />
                      );
                    })}
                  </div>

                  {/* Allocation Legend */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-muted">
                    {allocations.map((alloc, idx) => {
                      const color = ALLOCATION_PALETTE[idx % ALLOCATION_PALETTE.length];
                      const pct = Number(alloc.allocationPercentage || 0);
                      return (
                        <div key={alloc.assetId || alloc.symbol} className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 inline-block shrink-0 rounded-xs"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-semibold text-ink uppercase">
                            {alloc.symbol}
                          </span>
                          <span className="text-muted truncate max-w-[140px]" title={alloc.name}>
                            {alloc.name}
                          </span>
                          <span className="tabular-nums font-medium text-ink">
                            {pct.toFixed(2)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Holdings Table */}
            <section id="holdings-section">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink">
                  Holdings
                </h2>
                <span id="holdings-count" className="text-xs text-muted tabular-nums">
                  {holdings.length} {holdings.length === 1 ? 'asset' : 'assets'}
                </span>
              </div>

              {holdings.length === 0 ? (
                <div id="holdings-empty" className="p-8 border border-rule text-center space-y-2">
                  <p className="text-sm text-muted">
                    No assets yet. Add one to start tracking.
                  </p>
                  {selectedPortfolioId && (
                    <Link
                      to={`/portfolios/${selectedPortfolioId}`}
                      className="text-xs text-accent hover:underline font-medium inline-block"
                    >
                      + Add asset to portfolio
                    </Link>
                  )}
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
                      {holdings.map((asset) => {
                        const isBest =
                          holdings.length > 1 &&
                          bestPerformerSymbol &&
                          asset.symbol === bestPerformerSymbol;
                        const isWorst =
                          holdings.length > 1 &&
                          worstPerformerSymbol &&
                          asset.symbol === worstPerformerSymbol;

                        const qty = Number(asset.quantity || 0);
                        const avgCost = Number(asset.avgCost || 0);
                        const price = Number(asset.currentPrice || 0);
                        const val = Number(asset.marketValue || 0);
                        const unrealized = Number(asset.unrealizedProfit || 0);
                        const retPct = asset.returnPercentage != null ? Number(asset.returnPercentage) : 0;

                        return (
                          <tr
                            key={asset.assetId || asset.symbol}
                            id={`holding-row-${asset.symbol}`}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            {/* Asset Name + Symbol + Best/Worst Tag */}
                            <td className="py-3 px-3">
                              <div className="flex items-center flex-wrap gap-1.5">
                                <span className="font-semibold uppercase text-ink">
                                  {asset.symbol}
                                </span>
                                <span className="text-xs text-muted truncate max-w-[180px]" title={asset.name}>
                                  {asset.name}
                                </span>

                                {/* Best Performer Badge */}
                                {isBest && (
                                  <span
                                    id={`performer-tag-best-${asset.symbol}`}
                                    className="px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider rounded-xs border border-slate-300 bg-slate-100 text-slate-800"
                                  >
                                    Best
                                  </span>
                                )}

                                {/* Worst Performer Badge */}
                                {isWorst && (
                                  <span
                                    id={`performer-tag-worst-${asset.symbol}`}
                                    className="px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider rounded-xs border border-slate-300 bg-slate-100 text-slate-800"
                                  >
                                    Worst
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Qty */}
                            <td className="py-3 px-3 text-right tabular-nums text-xs">
                              {formatQuantity(qty)}
                            </td>

                            {/* Avg cost */}
                            <td className="py-3 px-3 text-right tabular-nums text-xs">
                              {formatCurrency(avgCost)}
                            </td>

                            {/* Price */}
                            <td className="py-3 px-3 text-right tabular-nums text-xs">
                              {formatCurrency(price)}
                            </td>

                            {/* Value */}
                            <td className="py-3 px-3 text-right tabular-nums text-xs font-medium">
                              {formatCurrency(val)}
                            </td>

                            {/* Unrealized Profit/Loss */}
                            <td className="py-3 px-3 text-right tabular-nums text-xs font-medium">
                              {formatSignedCurrency(unrealized)}
                            </td>

                            {/* Return % */}
                            <td className="py-3 px-3 text-right tabular-nums text-xs font-medium">
                              {formatSignedPercent(retPct)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
