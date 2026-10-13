import { formatCurrency, formatQuantity, formatDateTime } from '../../utils/formatters';

export const TransactionHistory = ({
  transactions = [],
  loading = false,
  error = null,
  onAddTransaction,
}) => {
  if (loading) {
    return (
      <div className="py-6 px-4 bg-slate-50/50 border-t border-rule text-center">
        <p className="text-xs text-muted">Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4 bg-slate-50/50 border-t border-rule text-center">
        <p className="text-xs text-loss">{error}</p>
      </div>
    );
  }

  // Ensure newest first: sort descending by transactionDate
  const sorted = [...transactions].sort((a, b) => {
    const timeA = new Date(a.transactionDate).getTime() || 0;
    const timeB = new Date(b.transactionDate).getTime() || 0;
    return timeB - timeA;
  });

  return (
    <div className="bg-slate-50/70 border-t border-rule p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider">
            Transaction history
          </span>
          <span className="text-xs text-muted tabular-nums">
            ({sorted.length} {sorted.length === 1 ? 'record' : 'records'})
          </span>
        </div>
        {onAddTransaction && (
          <button
            type="button"
            onClick={onAddTransaction}
            className="text-xs text-accent hover:underline font-medium cursor-pointer"
          >
            + Add transaction
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-rule rounded-sm bg-surface">
          <p className="text-xs text-muted">No transactions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-rule bg-surface rounded-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-rule bg-slate-100/60 text-muted">
                <th className="py-2 px-3 font-medium">Date</th>
                <th className="py-2 px-3 font-medium">Type</th>
                <th className="py-2 px-3 font-medium text-right">Quantity</th>
                <th className="py-2 px-3 font-medium text-right">Price per unit</th>
                <th className="py-2 px-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-normal text-ink">
              {sorted.map((tx) => {
                const total = Number(tx.quantity || 0) * Number(tx.pricePerUnit || 0);
                const isBuy = tx.transactionType === 'BUY';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-muted tabular-nums whitespace-nowrap">
                      {formatDateTime(tx.transactionDate)}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isBuy ? (
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded-xs bg-slate-200 text-slate-800 border border-slate-300">
                          BUY
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded-xs bg-zinc-200 text-zinc-800 border border-zinc-400">
                          SELL
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums font-mono">
                      {formatQuantity(tx.quantity)}
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {formatCurrency(tx.pricePerUnit)}
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums font-medium">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
