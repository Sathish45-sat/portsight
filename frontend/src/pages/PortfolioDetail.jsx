import { useState, useEffect, useCallback, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AssetForm from '../components/asset/AssetForm';
import TransactionForm from '../components/transaction/TransactionForm';
import TransactionHistory from '../components/transaction/TransactionHistory';
import useAssets from '../hooks/useAssets';
import portfolioApi from '../api/portfolioApi';
import {
  formatCurrency,
  formatQuantity,
} from '../utils/formatters';

export const PortfolioDetail = () => {
  const { id } = useParams();
  const portfolioId = id ? Number(id) : null;

  // Portfolio metadata
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState(null);

  // Assets and transactions hook
  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
    fetchAssets,
    createAsset,
    updatePrice,
    removeAsset,
    transactionsByAsset,
    fetchTransactions,
    recordTransaction,
  } = useAssets(portfolioId);

  // Modals state
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [transactingAsset, setTransactingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Expandable transaction history state: set of expanded asset IDs
  const [expandedAssetIds, setExpandedAssetIds] = useState(new Set());

  // Inline price update state
  const [editingPriceAssetId, setEditingPriceAssetId] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const [priceUpdating, setPriceUpdating] = useState(false);
  const [priceUpdateError, setPriceUpdateError] = useState('');

  // Fetch portfolio details for header
  const loadPortfolio = useCallback(async () => {
    if (!portfolioId) return;
    setPortfolioLoading(true);
    setPortfolioError(null);
    try {
      const data = await portfolioApi.getById(portfolioId);
      setPortfolio(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load portfolio details.';
      setPortfolioError(message);
    } finally {
      setPortfolioLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // Total portfolio value computed purely on client for display
  const totalValue = assets.reduce((sum, asset) => {
    const qty = Number(asset.quantityHeld || 0);
    const price = Number(asset.currentPrice || 0);
    return sum + qty * price;
  }, 0);

  // Toggle History expansion: on expand, fetch transactions for that asset on-demand
  const toggleHistory = (assetId) => {
    setExpandedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
        // Requirement: Fetch transactions per asset only when user expands that asset's history
        fetchTransactions(assetId);
      }
      return next;
    });
  };

  // Start inline price editing
  const startEditingPrice = (asset) => {
    setEditingPriceAssetId(asset.id);
    setEditingPriceValue(asset.currentPrice !== null && asset.currentPrice !== undefined ? String(asset.currentPrice) : '');
    setPriceUpdateError('');
  };

  const cancelEditingPrice = () => {
    setEditingPriceAssetId(null);
    setEditingPriceValue('');
    setPriceUpdateError('');
  };

  const handleSavePrice = async (assetId) => {
    const numPrice = Number(editingPriceValue);
    if (!editingPriceValue || isNaN(numPrice) || numPrice <= 0) {
      setPriceUpdateError('Price must be a positive number.');
      return;
    }

    setPriceUpdating(true);
    setPriceUpdateError('');
    try {
      await updatePrice(assetId, numPrice);
      setEditingPriceAssetId(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to update price.';
      setPriceUpdateError(message);
    } finally {
      setPriceUpdating(false);
    }
  };

  // Delete asset handler
  const handleDeleteAssetConfirm = async () => {
    if (!deletingAsset) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await removeAsset(deletingAsset.id);
      setDeletingAsset(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to delete asset.';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAssetType = (type) => {
    if (type === 'STOCK') return 'Stock';
    if (type === 'MUTUAL_FUND') return 'Mutual Fund';
    return type || '—';
  };

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            to="/portfolios"
            className="text-xs text-accent hover:underline mb-2 inline-block cursor-pointer"
          >
            ← Back to portfolios
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-rule">
            <div>
              <h1 id="portfolio-title" className="text-xl font-semibold text-ink tracking-tight">
                {portfolio?.name || (portfolioLoading ? 'Loading portfolio...' : `Portfolio #${id}`)}
              </h1>
              <p className="text-sm text-muted mt-0.5">
                Assets and holdings breakdown
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/dashboard?portfolioId=${id}`}
                id="view-dashboard-link"
                className="bg-surface text-ink border border-rule text-sm font-medium px-3.5 py-1.5 rounded-sm hover:bg-slate-50 transition-colors"
              >
                View dashboard
              </Link>
              <button
                id="add-asset-btn"
                type="button"
                onClick={() => setIsAddAssetModalOpen(true)}
                className="bg-accent text-surface text-sm font-medium px-3.5 py-1.5 rounded-sm hover:opacity-95 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
              >
                + Add asset
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Summary Row */}
        <section className="mb-8">
          <span className="text-xs font-medium text-muted uppercase tracking-wider block mb-1">
            Total portfolio value
          </span>
          <span id="portfolio-total-value" className="font-serif text-3xl sm:text-4xl text-ink tabular-nums tracking-tight block">
            {formatCurrency(totalValue)}
          </span>
          <p className="text-xs text-muted mt-1">
            Computed from active holdings and current prices
          </p>
        </section>

        {/* Assets Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">
              Assets
            </h2>
            <span id="asset-count" className="text-xs text-muted tabular-nums">
              {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
            </span>
          </div>

          {/* Loading state */}
          {assetsLoading && (
            <div id="assets-loading" className="p-12 border border-rule text-center">
              <p className="text-sm text-muted">Loading assets...</p>
            </div>
          )}

          {/* Error state */}
          {!assetsLoading && assetsError && (
            <div id="assets-error" className="p-8 border border-loss/40 text-center space-y-3">
              <p className="text-sm text-loss">{assetsError}</p>
              <button
                type="button"
                onClick={fetchAssets}
                className="text-xs text-accent hover:underline cursor-pointer"
              >
                Retry loading assets
              </button>
            </div>
          )}

          {/* Empty state: exactly matching user requirement */}
          {!assetsLoading && !assetsError && assets.length === 0 && (
            <div id="assets-empty" className="p-12 border border-rule text-center space-y-3">
              <p className="text-sm text-muted">
                No assets yet. Add one to start tracking.
              </p>
              <button
                type="button"
                onClick={() => setIsAddAssetModalOpen(true)}
                className="text-xs text-accent hover:underline font-medium cursor-pointer"
              >
                + Add your first asset
              </button>
            </div>
          )}

          {/* Assets Table */}
          {!assetsLoading && !assetsError && assets.length > 0 && (
            <div className="overflow-x-auto border border-rule">
              <table className="w-full text-left text-sm border-collapse rounded-none">
                <thead>
                  <tr className="border-b border-rule bg-surface text-xs text-muted">
                    <th className="py-2.5 px-3 font-medium">Symbol</th>
                    <th className="py-2.5 px-3 font-medium">Name</th>
                    <th className="py-2.5 px-3 font-medium">Type</th>
                    <th className="py-2.5 px-3 font-medium text-right">Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Avg cost</th>
                    <th className="py-2.5 px-3 font-medium text-right">Price</th>
                    <th className="py-2.5 px-3 font-medium text-right">Value</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule bg-surface text-ink">
                  {assets.map((asset) => {
                    const isEditingPrice = editingPriceAssetId === asset.id;
                    const isExpanded = expandedAssetIds.has(asset.id);
                    const qtyHeld = Number(asset.quantityHeld || 0);
                    const currentPrice = Number(asset.currentPrice || 0);
                    const avgCost = Number(asset.avgBuyPrice || 0);
                    const computedValue = qtyHeld * currentPrice;

                    return (
                      <Fragment key={asset.id}>
                        <tr
                          id={`asset-row-${asset.id}`}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          {/* Symbol */}
                          <td className="py-3 px-3 font-semibold uppercase text-ink">
                            {asset.symbol}
                          </td>

                          {/* Name */}
                          <td className="py-3 px-3 text-muted text-xs max-w-[200px] truncate" title={asset.name}>
                            {asset.name}
                          </td>

                          {/* Type */}
                          <td className="py-3 px-3 text-xs text-muted whitespace-nowrap">
                            <span className="inline-block px-1.5 py-0.5 rounded-xs border border-rule bg-slate-50 text-[11px]">
                              {formatAssetType(asset.assetType)}
                            </span>
                          </td>

                          {/* Qty */}
                          <td className="py-3 px-3 text-right tabular-nums text-xs">
                            {formatQuantity(asset.quantityHeld)}
                          </td>

                          {/* Avg cost */}
                          <td className="py-3 px-3 text-right tabular-nums text-xs">
                            {formatCurrency(avgCost)}
                          </td>

                          {/* Price: Inline Edit or Display */}
                          <td className="py-3 px-3 text-right tabular-nums text-xs">
                            {isEditingPrice ? (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    id={`inline-price-input-${asset.id}`}
                                    type="number"
                                    step="0.0001"
                                    min="0.0001"
                                    autoFocus
                                    disabled={priceUpdating}
                                    value={editingPriceValue}
                                    onChange={(e) => setEditingPriceValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSavePrice(asset.id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditingPrice();
                                      }
                                    }}
                                    className="w-24 border border-accent bg-surface rounded-sm px-2 py-1 text-xs text-right text-ink focus:outline-none tabular-nums"
                                  />
                                  <button
                                    id={`inline-price-save-${asset.id}`}
                                    type="button"
                                    onClick={() => handleSavePrice(asset.id)}
                                    disabled={priceUpdating}
                                    className="px-2 py-1 text-[11px] font-medium bg-accent text-surface rounded-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                  >
                                    {priceUpdating ? '...' : 'Save'}
                                  </button>
                                  <button
                                    id={`inline-price-cancel-${asset.id}`}
                                    type="button"
                                    onClick={cancelEditingPrice}
                                    disabled={priceUpdating}
                                    className="px-2 py-1 text-[11px] text-muted border border-rule rounded-sm hover:text-ink cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                                {priceUpdateError && (
                                  <span className="text-[10px] text-loss">
                                    {priceUpdateError}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span>{formatCurrency(currentPrice)}</span>
                            )}
                          </td>

                          {/* Value: quantityHeld × currentPrice */}
                          <td className="py-3 px-3 text-right tabular-nums text-xs font-medium">
                            {formatCurrency(computedValue)}
                          </td>

                          {/* Row Actions */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2.5 text-xs">
                              {!isEditingPrice && (
                                <button
                                  type="button"
                                  id={`update-price-btn-${asset.id}`}
                                  onClick={() => startEditingPrice(asset)}
                                  className="text-accent hover:underline cursor-pointer"
                                >
                                  Update price
                                </button>
                              )}

                              <button
                                type="button"
                                id={`add-transaction-btn-${asset.id}`}
                                onClick={() => setTransactingAsset(asset)}
                                className="text-accent hover:underline font-medium cursor-pointer"
                              >
                                Add transaction
                              </button>

                              <button
                                type="button"
                                id={`history-btn-${asset.id}`}
                                onClick={() => toggleHistory(asset.id)}
                                className={`text-muted hover:text-ink cursor-pointer ${
                                  isExpanded ? 'font-medium text-ink underline' : ''
                                }`}
                              >
                                History {isExpanded ? '▴' : '▾'}
                              </button>

                              <button
                                type="button"
                                id={`delete-asset-btn-${asset.id}`}
                                onClick={() => {
                                  setDeletingAsset(asset);
                                  setDeleteError('');
                                }}
                                className="text-loss hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Transaction History Row */}
                        {isExpanded && (
                          <tr id={`asset-history-row-${asset.id}`}>
                            <td colSpan={8} className="p-0">
                              <TransactionHistory
                                transactions={transactionsByAsset[asset.id]?.data}
                                loading={transactionsByAsset[asset.id]?.loading}
                                error={transactionsByAsset[asset.id]?.error}
                                onAddTransaction={() => setTransactingAsset(asset)}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add Asset Modal */}
      {isAddAssetModalOpen && (
        <div
          id="add-asset-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-[1px]"
        >
          <div className="w-full max-w-md bg-surface border border-rule rounded-sm shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-rule">
              <h2 className="text-base font-semibold text-ink">
                Add new asset
              </h2>
              <button
                type="button"
                onClick={() => setIsAddAssetModalOpen(false)}
                className="text-muted hover:text-ink text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <AssetForm
              onSubmit={async (data) => {
                await createAsset(data);
                setIsAddAssetModalOpen(false);
              }}
              onCancel={() => setIsAddAssetModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {transactingAsset && (
        <div
          id="add-transaction-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-[1px]"
        >
          <div className="w-full max-w-md bg-surface border border-rule rounded-sm shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-rule">
              <h2 className="text-base font-semibold text-ink">
                Record transaction
              </h2>
              <button
                type="button"
                onClick={() => setTransactingAsset(null)}
                className="text-muted hover:text-ink text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <TransactionForm
              asset={transactingAsset}
              onSubmit={async (data) => {
                await recordTransaction(transactingAsset.id, data);
                // Also ensure history is opened so the user sees the updated transaction ledger
                setExpandedAssetIds((prev) => new Set([...prev, transactingAsset.id]));
                setTransactingAsset(null);
              }}
              onCancel={() => setTransactingAsset(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Asset Confirmation Modal */}
      {deletingAsset && (
        <div
          id="delete-asset-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-[1px]"
        >
          <div className="w-full max-w-md bg-surface border border-rule rounded-sm shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-rule">
              <h2 className="text-base font-semibold text-ink">
                Delete asset
              </h2>
              <button
                type="button"
                onClick={() => setDeletingAsset(null)}
                disabled={isDeleting}
                className="text-muted hover:text-ink text-sm cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <p id="delete-asset-confirm-message" className="text-sm text-ink mb-6">
              Delete {deletingAsset.symbol} and all its transactions? This can't be undone.
            </p>

            {deleteError && (
              <p className="mb-4 text-xs text-loss">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-rule">
              <button
                type="button"
                onClick={() => setDeletingAsset(null)}
                disabled={isDeleting}
                className="text-sm text-muted hover:text-ink px-3 py-1.5 border border-rule rounded-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-asset-btn"
                type="button"
                onClick={handleDeleteAssetConfirm}
                disabled={isDeleting}
                className="bg-loss text-white text-sm font-medium px-4 py-1.5 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-loss"
              >
                {isDeleting ? 'Deleting...' : 'Delete asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDetail;
