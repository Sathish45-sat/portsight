import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PortfolioForm from '../components/portfolio/PortfolioForm';
import usePortfolios from '../hooks/usePortfolios';
import { formatDate } from '../utils/formatters';

export const Portfolios = () => {
  const {
    portfolios,
    loading,
    error,
    fetchPortfolios,
    create,
    rename,
    remove,
  } = usePortfolios();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isCreateModalOpen) setIsCreateModalOpen(false);
        if (editingPortfolio) setEditingPortfolio(null);
        if (deletingPortfolio) {
          setDeletingPortfolio(null);
          setActionError(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, editingPortfolio, deletingPortfolio]);

  const handleCreate = async (name) => {
    setActionError(null);
    await create(name);
    setIsCreateModalOpen(false);
  };

  const handleRename = async (name) => {
    if (!editingPortfolio) return;
    setActionError(null);
    await rename(editingPortfolio.id, name);
    setEditingPortfolio(null);
  };

  const openDeleteModal = (portfolio) => {
    setActionError(null);
    setDeletingPortfolio(portfolio);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPortfolio) return;
    setActionError(null);
    setIsDeleting(true);

    try {
      await remove(deletingPortfolio.id);
      setDeletingPortfolio(null);
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        (err.response?.data?.validationErrors
          ? Object.values(err.response.data.validationErrors).join('. ')
          : null) ||
        err.message ||
        'Unable to delete portfolio.';
      setActionError(backendMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-rule mb-8">
          <div>
            <h1 className="text-xl font-semibold text-ink tracking-tight">
              Portfolios
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Manage your investment portfolios and asset containers.
            </p>
          </div>

          <button
            id="create-portfolio-btn"
            type="button"
            onClick={() => {
              setActionError(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-accent text-surface text-sm font-medium px-3.5 py-2 rounded-sm hover:opacity-95 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
          >
            Create portfolio
          </button>
        </div>

        {/* Action / Conflict error notification near the list */}
        {actionError && !deletingPortfolio && (
          <div
            id="portfolio-action-error"
            className="mb-6 p-3.5 border border-loss/40 bg-surface text-sm text-loss rounded-sm flex items-start justify-between gap-3"
            role="alert"
          >
            <p>{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-xs text-muted hover:text-ink cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* State 1: Loading */}
        {loading && (
          <div id="portfolios-loading" className="p-12 border border-rule text-center">
            <p className="text-sm text-muted">Loading portfolios...</p>
          </div>
        )}

        {/* State 2: Error with Retry */}
        {!loading && error && (
          <div id="portfolios-error" className="p-8 border border-loss/40 text-center space-y-3">
            <p className="text-sm text-loss">{error}</p>
            <button
              type="button"
              onClick={fetchPortfolios}
              className="bg-accent text-surface text-sm font-medium px-3.5 py-1.5 rounded-sm hover:opacity-95 cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
            >
              Retry
            </button>
          </div>
        )}

        {/* State 3: Empty */}
        {!loading && !error && portfolios.length === 0 && (
          <div id="portfolios-empty" className="p-12 border border-rule text-center">
            <p className="text-sm text-muted">
              No portfolios yet. Create one to start tracking.
            </p>
          </div>
        )}

        {/* State 4: List rows */}
        {!loading && !error && portfolios.length > 0 && (
          <div className="overflow-x-auto border border-rule">
            <table className="w-full text-left text-sm border-collapse rounded-none">
              <thead>
                <tr className="border-b border-rule bg-surface text-xs text-muted">
                  <th className="py-2.5 px-4 font-medium">Portfolio</th>
                  <th className="py-2.5 px-4 font-medium text-right">Created</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule bg-surface text-ink">
                {portfolios.map((portfolio) => (
                  <tr
                    key={portfolio.id}
                    id={`portfolio-row-${portfolio.id}`}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/portfolios/${portfolio.id}`}
                        className="font-medium text-ink hover:text-accent hover:underline block"
                      >
                        {portfolio.name}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-muted text-xs">
                      {formatDate(portfolio.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => setEditingPortfolio(portfolio)}
                          className="text-accent hover:underline cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(portfolio)}
                          className="text-loss hover:underline cursor-pointer"
                        >
                          Delete portfolio
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal: Create Portfolio */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-ink/30 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface border border-rule w-full max-w-sm p-6 rounded-sm shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-1">
              Create portfolio
            </h2>
            <p className="text-xs text-muted mb-4">
              Enter a name for your new investment portfolio.
            </p>

            <PortfolioForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateModalOpen(false)}
              submitLabel="Create portfolio"
            />
          </div>
        </div>
      )}

      {/* Modal: Rename Portfolio */}
      {editingPortfolio && (
        <div
          className="fixed inset-0 bg-ink/30 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface border border-rule w-full max-w-sm p-6 rounded-sm shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-1">
              Rename portfolio
            </h2>
            <p className="text-xs text-muted mb-4">
              Update the name for &ldquo;{editingPortfolio.name}&rdquo;.
            </p>

            <PortfolioForm
              initialName={editingPortfolio.name}
              onSubmit={handleRename}
              onCancel={() => setEditingPortfolio(null)}
              submitLabel="Save changes"
            />
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation (names portfolio, says 'Delete portfolio', handles conflict errors) */}
      {deletingPortfolio && (
        <div
          className="fixed inset-0 bg-ink/30 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface border border-rule w-full max-w-sm p-6 rounded-sm shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-1">
              Delete portfolio
            </h2>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete &ldquo;{deletingPortfolio.name}&rdquo;?
            </p>

            {actionError && (
              <div
                id="delete-conflict-error"
                className="mb-4 p-3 border border-loss/40 bg-surface text-xs text-loss rounded-sm"
                role="alert"
              >
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule">
              <button
                type="button"
                onClick={() => {
                  setDeletingPortfolio(null);
                  setActionError(null);
                }}
                disabled={isDeleting}
                className="text-sm text-muted hover:text-ink px-3 py-1.5 border border-rule rounded-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-button"
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-loss text-surface text-sm font-medium px-3.5 py-1.5 rounded-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-loss"
              >
                {isDeleting ? 'Deleting...' : 'Delete portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolios;
