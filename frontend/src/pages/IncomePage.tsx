/**
 * Dedicated Income Management Module.
 * Requirement 9: Salary, Freelancing, Business, etc. with full CRUD and frequency tracking.
 */

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { api } from '../services/api';
import { Income } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

const SOURCES = [
  'Salary',
  'Freelancing',
  'Scholarship',
  'Business',
  'Interest',
  'Investment',
  'Other',
];

const FREQUENCIES = ['Monthly', 'Bi-weekly', 'Weekly', 'Quarterly', 'One-time'];

export const IncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState({
    source: 'Salary',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'Monthly',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const data = await api.getIncomes({
        source: sourceFilter === 'all' ? undefined : sourceFilter,
      });
      setIncomes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [sourceFilter]);

  const handleOpenAdd = () => {
    setEditingIncome(null);
    setFormData({
      source: 'Salary',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'Monthly',
      description: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inc: Income) => {
    setEditingIncome(inc);
    setFormData({
      source: inc.source,
      amount: String(inc.amount),
      date: inc.date,
      frequency: inc.frequency,
      description: inc.description || '',
    });
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
      if (editingIncome) {
        await api.updateIncome(editingIncome.id, {
          source: formData.source,
          amount: amt,
          date: formData.date,
          frequency: formData.frequency,
          description: formData.description,
        });
      } else {
        await api.createIncome({
          source: formData.source,
          amount: amt,
          date: formData.date,
          frequency: formData.frequency,
          description: formData.description,
        });
      }
      setIsModalOpen(false);
      fetchIncomes();
    } catch (err: any) {
      setFormError(err.message || 'Error saving income record.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteIncome(id);
      setDeletingId(null);
      fetchIncomes();
    } catch (err) {
      console.error(err);
    }
  };

  const totalMonthlyIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const filtered = incomes.filter((inc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return inc.source.toLowerCase().includes(q) || (inc.description && inc.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Income
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs uppercase flex items-center gap-2 shadow-sm shadow-purple-500/20 active:scale-[0.98] transition-all w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>ADD INCOME STREAM</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="TOTAL INCOME RECORDED" value={formatINR(totalMonthlyIncome)} isSuccess />
        <StatCard label="ACTIVE STREAMS" value={incomes.length} />
        <StatCard label="PRIMARY SOURCE" value={incomes[0]?.source || 'Salary'} />
      </div>

      {/* Filter and Table */}
      <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_#000] space-y-3 font-mono-tech text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center border-2 border-black px-3 py-1.5 bg-[#F7F7F4] w-full">
            <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter income records..."
              className="w-full bg-transparent outline-none text-black font-mono-tech text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold uppercase text-neutral-600">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border-2 border-black px-2 py-1.5 bg-white font-mono-tech text-xs outline-none"
            >
              <option value="all">ALL SOURCES</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
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
                <th className="py-3 px-3.5 border-r border-neutral-300">SOURCE</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">AMOUNT</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">FREQUENCY</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">DATE</th>
                <th className="py-3 px-3.5 border-r border-neutral-300">DESCRIPTION</th>
                <th className="py-3 px-3.5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    Loading income records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    No income streams found. Click "ADD INCOME STREAM" to record income.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 font-bold text-black">
                      <span className="neo-badge bg-[#DCFCE7] text-emerald-950 border-emerald-400 mr-2">
                        {inc.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 font-black text-emerald-700 text-right">
                      +{formatINR(Number(inc.amount))}
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 font-bold">
                      {inc.frequency}
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 text-neutral-600">
                      {formatDate(inc.date)}
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-neutral-200 text-neutral-600">
                      {inc.description || '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="p-1 border border-black bg-white hover:bg-neutral-100"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeletingId(inc.id)}
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
        title={editingIncome ? 'EDIT INCOME STREAM' : 'ADD INCOME STREAM'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-500 text-red-800 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Amount (INR)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="60000.00"
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">Description / Notes</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Monthly salary from Tech Corp"
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
              SAVE STREAM
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
          <div className="space-y-4 font-mono-tech text-xs">
            <p>Delete this income stream? This will update your total revenue metrics.</p>
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
