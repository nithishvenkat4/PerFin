/**
 * Category-based Budget Management Page.
 * Requirement 11: Budget CRUD, Spent tracking, Remaining balance, 80% warning and 100% exceeded alerts.
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Edit2, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { api } from '../services/api';
import { Budget } from '../types';
import { formatINR } from '../utils/formatters';

const PRESET_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Personal Care',
  'Other',
];

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    period: 'monthly',
    alert_threshold: 80,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await api.getBudgets();
      setBudgets(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setFormData({
      category: 'Food',
      amount: '',
      period: 'monthly',
      alert_threshold: 80,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormData({
      category: b.category,
      amount: String(b.amount),
      period: b.period,
      alert_threshold: b.alert_threshold,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Budget amount must be greater than 0.');
      return;
    }

    try {
      if (editingBudget) {
        await api.updateBudget(editingBudget.id, {
          category: formData.category,
          amount: amt,
          period: formData.period,
          alert_threshold: Number(formData.alert_threshold),
        });
      } else {
        await api.createBudget({
          category: formData.category,
          amount: amt,
          period: formData.period,
          alert_threshold: Number(formData.alert_threshold),
        });
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err: any) {
      setFormError(err.message || 'Error saving budget.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBudget(id);
      setDeletingId(null);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const totalAllocated = budgets.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + Number(curr.spent), 0);
  const exceededCount = budgets.filter((b) => b.status === 'exceeded').length;
  const warningCount = budgets.filter((b) => b.status === 'warning').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Budgets
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs uppercase flex items-center gap-2 shadow-sm shadow-purple-500/20 active:scale-[0.98] transition-all w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>NEW BUDGET</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="TOTAL BUDGET POOL" value={formatINR(totalAllocated)} />
        <StatCard label="CURRENT EXPENDITURE" value={formatINR(totalSpent)} />
        <StatCard label="80% WARNING THRESHOLDS" value={warningCount} isAlert={warningCount > 0} />
        <StatCard label="EXCEEDED CAPS" value={exceededCount} isAlert={exceededCount > 0} />
      </div>

      {/* Budgets Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">
            Loading budget allocation status...
          </div>
        ) : budgets.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
            <p className="text-sm font-semibold text-slate-700">No category budgets configured yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Set spending limits to monitor category expenditures against ledger entries</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#1E1B4B] font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Budget</span>
            </button>
          </div>
        ) : (
          budgets.map((b) => {
            const pct = b.percentage_used || 0;
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200">
                    <span className="font-heading-tech text-lg font-black text-black uppercase">
                      {b.category}
                    </span>
                    {isExceeded ? (
                      <span className="neo-badge bg-[#FEE2E2] text-red-950 border-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        <span>100% EXCEEDED</span>
                      </span>
                    ) : isWarning ? (
                      <span className="neo-badge bg-[#FEF08A] text-amber-950 border-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>80% WARNING</span>
                      </span>
                    ) : (
                      <span className="neo-badge bg-[#DCFCE7] text-emerald-950 border-emerald-500">
                        HEALTHY
                      </span>
                    )}
                  </div>

                  {/* Amounts */}
                  <div className="space-y-1 font-mono-tech mb-4">
                    <div className="text-2xl font-black text-black">
                      {formatINR(Number(b.spent))}{' '}
                      <span className="text-sm text-neutral-500 font-normal">
                        / {formatINR(Number(b.amount))}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 flex justify-between">
                      <span>Remaining: <strong className="text-black">{formatINR(Number(b.remaining))}</strong></span>
                      <span>{pct}% Used</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3.5 bg-neutral-100 border-2 border-black overflow-hidden mb-4">
                    <div
                      className={`h-full transition-all ${
                        isExceeded ? 'bg-red-600' : isWarning ? 'bg-amber-400' : 'bg-[#D4FF00]'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-200 font-mono-tech text-xs">
                  <span className="uppercase text-[10px] text-neutral-500 font-bold">
                    CAP: {b.period.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 border border-black bg-white hover:bg-neutral-100 font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>EDIT</span>
                    </button>
                    <button
                      onClick={() => setDeletingId(b.id)}
                      className="p-1.5 border border-black bg-white hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'UPDATE BUDGET LIMIT' : 'CREATE CATEGORY BUDGET'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-500 text-red-800 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
            >
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">
              Monthly Budget Amount (INR)
            </label>
            <input
              type="number"
              step="100"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="5000.00"
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none font-bold text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Period</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">
                Warning Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="95"
                required
                value={formData.alert_threshold}
                onChange={(e) => setFormData({ ...formData, alert_threshold: Number(e.target.value) })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none font-bold"
              />
            </div>
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
              COMMIT BUDGET
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
            <p>Delete this budget cap? It will no longer track alerts on this category.</p>
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
                DELETE BUDGET
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
