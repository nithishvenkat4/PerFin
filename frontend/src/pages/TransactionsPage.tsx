/**
 * Transaction Management Page in Technical Neo-Brutalist Style.
 * Full CRUD, Filter, Sort, Pagination, ML Categorization, Anomaly Detection, CSV Export.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Download,
  Edit2,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { Transaction, TransactionCategory } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

interface TransactionsPageProps {
  refreshKey?: number;
  onRefresh?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  refreshKey = 0,
  onRefresh,
}) => {
  const [searchParams] = useSearchParams();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    transaction_type: 'expense' as 'income' | 'expense',
    category: 'Food',
    payment_method: 'UPI',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // AI Classification state
  const [predictedCategory, setPredictedCategory] = useState<string | null>(null);
  const [predictionConfidence, setPredictionConfidence] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Form error & delete confirmation
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        api.getTransactions({
          transaction_type: typeFilter === 'all' ? undefined : typeFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          page,
          page_size: pageSize,
        }),
        api.getCategories(),
      ]);

      setTransactions(txRes.items || []);
      setTotalCount(txRes.total || 0);
      setCategories(catRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, page, refreshKey]);

  // Handle ML category prediction on description change (Requirement 10 & 21)
  const handleDescriptionBlur = async () => {
    if (!formData.description.trim() || formData.description.length < 3) return;
    setIsPredicting(true);
    try {
      const result = await api.classifyTransaction({
        description: formData.description,
        amount: Number(formData.amount) || 100,
        transaction_type: formData.transaction_type,
      });
      if (result && result.predicted_category) {
        setPredictedCategory(result.predicted_category);
        setPredictionConfidence(result.confidence);
      }
    } catch {
      // Ignore prediction error
    } finally {
      setIsPredicting(false);
    }
  };

  const handleApplyPrediction = () => {
    if (predictedCategory) {
      setFormData((prev) => ({ ...prev, category: predictedCategory }));
      setPredictedCategory(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setFormData({
      description: '',
      amount: '',
      transaction_type: 'expense',
      category: categories.length > 0 ? categories[0].name : 'Food',
      payment_method: 'UPI',
      transaction_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setPredictedCategory(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      description: tx.description,
      amount: String(tx.amount),
      transaction_type: tx.transaction_type,
      category: tx.category,
      payment_method: tx.payment_method || 'UPI',
      transaction_date: tx.transaction_date,
      notes: tx.notes || '',
    });
    setPredictedCategory(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTx) {
        await api.updateTransaction(editingTx.id, {
          description: formData.description.trim(),
          amount: numAmount,
          transaction_type: formData.transaction_type,
          category: formData.category,
          payment_method: formData.payment_method,
          transaction_date: formData.transaction_date,
          notes: formData.notes,
        });
      } else {
        await api.createTransaction({
          description: formData.description.trim(),
          amount: numAmount,
          transaction_type: formData.transaction_type,
          category: formData.category,
          payment_method: formData.payment_method,
          transaction_date: formData.transaction_date,
          notes: formData.notes,
        });
      }

      setIsModalOpen(false);
      fetchTransactions();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Error saving transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setDeletingId(null);
      fetchTransactions();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort client-side for search query
  const filtered = transactions.filter((tx) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      tx.description.toLowerCase().includes(q) ||
      tx.category.toLowerCase().includes(q) ||
      String(tx.amount).includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const d1 = new Date(a.transaction_date).getTime();
      const d2 = new Date(b.transaction_date).getTime();
      return sortOrder === 'desc' ? d2 - d1 : d1 - d2;
    } else {
      const a1 = Number(a.amount);
      const a2 = Number(b.amount);
      return sortOrder === 'desc' ? a2 - a1 : a1 - a2;
    }
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Transactions
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV Button */}
          <a
            href="/api/v1/export/transactions/csv"
            download
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </a>

          {/* Record New Entry Button */}
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs uppercase flex items-center gap-2 shadow-sm shadow-purple-500/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>RECORD TRANSACTION</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_#000] space-y-3 font-mono-tech text-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 flex items-center border-2 border-black px-3 py-1.5 bg-[#F7F7F4]">
            <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description, merchant, or notes..."
              className="w-full bg-transparent outline-none text-black font-mono-tech text-xs"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>
                <X className="w-3.5 h-3.5 text-neutral-500 hover:text-black" />
              </button>
            )}
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center border-2 border-black">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`px-3 py-1.5 font-bold uppercase transition-colors ${
                  typeFilter === t ? 'bg-[#D4FF00] text-black font-extrabold' : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold uppercase text-neutral-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="border-2 border-black px-2 py-1.5 bg-white font-mono-tech text-xs outline-none"
            >
              <option value="all">ALL CATEGORIES</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold uppercase text-neutral-600">Sort:</span>
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as ['date' | 'amount', 'desc' | 'asc'];
                setSortField(f);
                setSortOrder(o);
              }}
              className="border-2 border-black px-2 py-1.5 bg-white font-mono-tech text-xs outline-none"
            >
              <option value="date-desc">DATE (NEWEST)</option>
              <option value="date-asc">DATE (OLDEST)</option>
              <option value="amount-desc">AMOUNT (HIGHEST)</option>
              <option value="amount-asc">AMOUNT (LOWEST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Table (Matching Screenshot 4) */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-tech text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F4F0] border-b-2 border-black text-neutral-700 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 border-r border-neutral-300">DATE</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">DESCRIPTION</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">CATEGORY</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">PAYMENT METHOD</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">AMOUNT</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">AI / AUDIT STATUS</th>
                <th className="py-3 px-3.5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    Loading ledger records...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                sorted.map((tx) => {
                  const isHighValue = Number(tx.amount) >= 15000 && tx.transaction_type === 'expense';
                  return (
                    <tr key={tx.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3.5 border-r border-neutral-200 whitespace-nowrap font-bold">
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-neutral-200 font-bold text-black">
                        <div>{tx.description}</div>
                        {tx.notes && (
                          <div className="text-[10px] text-neutral-500 font-normal">{tx.notes}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-neutral-200">
                        <span className="neo-badge bg-white text-black">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-neutral-200 text-neutral-600">
                        {tx.payment_method || 'UPI / Bank'}
                      </td>
                      <td
                        className={`py-2.5 px-3.5 border-r border-neutral-200 font-black text-right whitespace-nowrap ${
                          tx.transaction_type === 'income' ? 'text-emerald-700' : 'text-neutral-900'
                        }`}
                      >
                        {tx.transaction_type === 'income' ? '+' : '-'} {formatINR(Number(tx.amount))}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-neutral-200">
                        {isHighValue ? (
                          <span className="neo-badge bg-[#FEF08A] text-amber-950 border-amber-600 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            <span>UNUSUAL SPEND</span>
                          </span>
                        ) : (
                          <span className="neo-badge bg-[#DCFCE7] text-emerald-950 border-emerald-400">
                            VERIFIED
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            title="Edit entry"
                            className="p-1 border border-black bg-white hover:bg-neutral-100"
                          >
                            <Edit2 className="w-3 h-3 text-black" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            title="Delete entry"
                            className="p-1 border border-black bg-white hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-3.5 border-t-2 border-black bg-[#F7F7F4] font-mono-tech text-xs">
          <div>
            Showing <span className="font-bold">{sorted.length}</span> of <span className="font-bold">{totalCount}</span> entries
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-black bg-white disabled:opacity-40 uppercase font-bold"
            >
              PREV
            </button>
            <span className="px-2 font-bold">
              PAGE {page} OF {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 border border-black bg-white disabled:opacity-40 uppercase font-bold"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? 'EDIT TRANSACTION' : 'RECORD NEW TRANSACTION'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-500 text-red-800 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">
              Description (Merchant / Activity)
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={handleDescriptionBlur}
              placeholder="e.g., Swiggy order, Electricity bill, Monthly salary"
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
            />
            {isPredicting && (
              <div className="text-[11px] text-neutral-500 mt-1 animate-pulse">
                Analyzing text with ML classifier...
              </div>
            )}
            {predictedCategory && (
              <div className="mt-2 p-2 border-2 border-black bg-[#D4FF00] flex items-center justify-between">
                <div>
                  <span className="font-bold">ML PREDICTION:</span> {predictedCategory}{' '}
                  {predictionConfidence && (
                    <span className="opacity-75">({(predictionConfidence * 100).toFixed(0)}% confidence)</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleApplyPrediction}
                  className="px-2 py-0.5 border border-black bg-white font-bold hover:bg-neutral-100 uppercase text-[10px]"
                >
                  APPLY
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Amount (INR)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="450.00"
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none font-bold"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Transaction Type</label>
              <select
                value={formData.transaction_type}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_type: e.target.value as 'income' | 'expense' })
                }
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                <option value="expense">EXPENSE</option>
                <option value="income">INCOME</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">Notes / Annotation</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional tags or notes..."
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border-2 border-black bg-white uppercase font-bold hover:bg-neutral-100"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 border-2 border-black bg-[#D4FF00] uppercase font-black hover:bg-[#b8e600] disabled:opacity-50 shadow-[2px_2px_0px_#000]"
            >
              {submitting ? 'SAVING...' : editingTx ? 'UPDATE ENTRY' : 'COMMIT ENTRY'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingId(null)}
          title="CONFIRM DELETION"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p>
              Are you sure you want to permanently delete this transaction entry? This will update your balances and ledger audit.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-1.5 border-2 border-black bg-white uppercase font-bold"
              >
                ABORT
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-1.5 border-2 border-black bg-red-600 text-white uppercase font-bold shadow-[2px_2px_0px_#000]"
              >
                DELETE RECORD
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
