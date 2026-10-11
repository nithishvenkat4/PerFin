/**
 * Dedicated Expense Management Module.
 * Requirement 10: Full CRUD, ML auto-classification (Swiggy -> Food & Dining), category filtering.
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Sparkles, Receipt } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { api } from '../services/api';
import { Transaction } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Healthcare',
  'Entertainment',
  'Bills',
  'Investment',
  'Personal Care',
  'Other',
];

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    payment_method: 'UPI',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // AI Classification
  const [predictedCategory, setPredictedCategory] = useState<string | null>(null);
  const [predictionConfidence, setPredictionConfidence] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        transaction_type: 'expense',
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        page: 1,
        page_size: 50,
      });
      setExpenses(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleDescriptionBlur = async () => {
    if (!formData.description.trim() || formData.description.length < 3) return;
    setIsPredicting(true);
    try {
      const res = await api.classifyTransaction({
        description: formData.description,
        amount: Number(formData.amount) || 250,
        transaction_type: 'expense',
      });
      if (res && res.predicted_category) {
        setPredictedCategory(res.predicted_category);
        setPredictionConfidence(res.confidence);
      }
    } catch {} finally {
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
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      category: 'Food',
      payment_method: 'UPI',
      transaction_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setPredictedCategory(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingExpense(tx);
    setFormData({
      description: tx.description,
      amount: String(tx.amount),
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
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Amount must be greater than 0.');
      return;
    }

    try {
      if (editingExpense) {
        await api.updateTransaction(editingExpense.id, {
          description: formData.description.trim(),
          amount: amt,
          transaction_type: 'expense',
          category: formData.category,
          payment_method: formData.payment_method,
          transaction_date: formData.transaction_date,
          notes: formData.notes,
        });
      } else {
        await api.createTransaction({
          description: formData.description.trim(),
          amount: amt,
          transaction_type: 'expense',
          category: formData.category,
          payment_method: formData.payment_method,
          transaction_date: formData.transaction_date,
          notes: formData.notes,
        });
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      setFormError(err.message || 'Error saving expense record.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setDeletingId(null);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const filtered = expenses.filter((tx) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return tx.description.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Expenses
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs uppercase flex items-center gap-2 shadow-sm shadow-purple-500/20 active:scale-[0.98] transition-all w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>LOG EXPENSE</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="TOTAL EXPENSES LOGGED" value={formatINR(totalExpense)} />
        <StatCard label="TOTAL LINE ITEMS" value={expenses.length} />
        <StatCard label="TOP CATEGORY" value={expenses[0]?.category || 'Food'} />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_#000] space-y-3 font-mono-tech text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center border-2 border-black px-3 py-1.5 bg-[#F7F7F4] w-full">
            <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter expenses by description or notes..."
              className="w-full bg-transparent outline-none text-black font-mono-tech text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold uppercase text-neutral-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border-2 border-black px-2 py-1.5 bg-white font-mono-tech text-xs outline-none"
            >
              <option value="all">ALL CATEGORIES</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                <th className="py-3 px-3.5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    Loading expenses...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 whitespace-nowrap font-bold">
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 font-bold text-black">
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-neutral-200">
                      <span className="neo-badge bg-white text-black">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 text-neutral-600">
                      {tx.payment_method || 'UPI'}
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 font-black text-neutral-900 text-right">
                      -{formatINR(Number(tx.amount))}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1 border border-black bg-white hover:bg-neutral-100"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeletingId(tx.id)}
                          className="p-1 border border-black bg-white hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'EDIT EXPENSE' : 'RECORD NEW EXPENSE'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-500 text-red-800 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">
              Description (Try: "Swiggy order" or "Uber ride")
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={handleDescriptionBlur}
              placeholder="e.g. Swiggy order, Amazon electronics, Metro card"
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
            />
            {isPredicting && (
              <div className="text-[11px] text-neutral-500 mt-1 animate-pulse">
                Predicting category with ML model...
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
              <label className="block uppercase font-bold text-neutral-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">Notes / Tags</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes..."
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border-2 border-black bg-white uppercase font-bold hover:bg-neutral-100"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2 border-2 border-black bg-[#D4FF00] uppercase font-black hover:bg-[#b8e600] shadow-[2px_2px_0px_#000]"
            >
              COMMIT EXPENSE
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      {deletingId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingId(null)}
          title="CONFIRM DELETION"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 font-mono-tech text-xs">
            <p>Delete this expense record? This will adjust your budget and spending totals.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-1.5 border-2 border-black bg-white uppercase font-bold"
              >
                ABORT
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-1.5 border-2 border-black bg-red-600 text-white uppercase font-bold"
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
