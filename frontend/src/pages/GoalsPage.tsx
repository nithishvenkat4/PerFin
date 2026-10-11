/**
 * Financial Goals & Emergency Fund Module.
 * Requirement 12 & 13: Goal CRUD, Required monthly contribution, Emergency Fund coverage.
 */

import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Edit2, Plus, ShieldCheck, Target, Trash2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { api } from '../services/api';
import { Goal } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

interface GoalsPageProps {
  refreshKey?: number;
  onRefresh?: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ refreshKey = 0, onRefresh }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Emergency Fund State (Section 13)
  const [monthlyEssential, setMonthlyEssential] = useState(15000);
  const [targetMonths, setTargetMonths] = useState(6);
  const currentEmergencySavings = 120000;
  const emergencyTarget = monthlyEssential * targetMonths;
  const emergencyCoverageMonths = (currentEmergencySavings / monthlyEssential).toFixed(1);
  const emergencyProgress = Math.min(100, Math.round((currentEmergencySavings / emergencyTarget) * 100));

  // Goal Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    target_date: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
    priority: 'high' as 'low' | 'medium' | 'high',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [refreshKey]);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '0',
      target_date: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
      priority: 'high',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: Goal) => {
    setEditingGoal(g);
    setFormData({
      name: g.name,
      target_amount: String(g.target_amount),
      current_amount: String(g.current_amount),
      target_date: g.target_date,
      priority: g.priority,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const targetAmt = parseFloat(formData.target_amount);
    const currentAmt = parseFloat(formData.current_amount || '0');

    if (isNaN(targetAmt) || targetAmt <= 0) {
      setFormError('Target amount must be greater than 0.');
      return;
    }

    try {
      if (editingGoal) {
        await api.updateGoal(editingGoal.id, {
          name: formData.name.trim(),
          target_amount: targetAmt,
          current_amount: currentAmt,
          target_date: formData.target_date,
          priority: formData.priority,
        });
      } else {
        await api.createGoal({
          name: formData.name.trim(),
          target_amount: targetAmt,
          current_amount: currentAmt,
          target_date: formData.target_date,
          priority: formData.priority,
        });
      }
      setIsModalOpen(false);
      fetchGoals();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Error saving goal.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGoal(id);
      setDeletingId(null);
      fetchGoals();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-mono-tech">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Goals & Emergency Buffer
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs uppercase flex items-center gap-2 shadow-sm shadow-purple-500/20 active:scale-[0.98] transition-all w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>NEW GOAL</span>
        </button>
      </div>

      {/* Emergency Fund Reserve Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-[#1E1B4B]">
                Emergency Reserve Buffer
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Target = Essential Monthly Expenses (₹{monthlyEssential.toLocaleString()}) × Target Horizon ({targetMonths} Months)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold">Target Horizon:</span>
            {[3, 6, 9, 12].map((m) => (
              <button
                key={m}
                onClick={() => setTargetMonths(m)}
                className={`px-2.5 py-1 border border-black font-bold uppercase ${
                  targetMonths === m ? 'bg-[#D4FF00] text-black shadow-[1px_1px_0px_#000]' : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {m} MO
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Fund Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <StatCard label="CURRENT EMERGENCY BUFFER" value={formatINR(currentEmergencySavings)} isSuccess />
          <StatCard label="TARGET FUND SIZE" value={formatINR(emergencyTarget)} />
          <StatCard label="MONTHS OF COVERAGE" value={`${emergencyCoverageMonths} MONTHS`} isSuccess />
          <StatCard label="FUNDING RATIO" value={`${emergencyProgress}%`} isSuccess />
        </div>

        {/* Emergency Fund Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span>RESERVE HEALTH STATUS: <strong className="text-emerald-700">OPTIMAL LIQUIDITY BUFFER</strong></span>
            <span>{formatINR(currentEmergencySavings)} / {formatINR(emergencyTarget)}</span>
          </div>
          <div className="w-full h-4 bg-neutral-100 border-2 border-black overflow-hidden">
            <div
              className="h-full bg-[#D4FF00] transition-all"
              style={{ width: `${Math.min(100, emergencyProgress)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Financial Goals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading-tech text-xl font-black text-black uppercase">
            ACTIVE CAPITAL GOALS ({goals.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-3 py-12 text-center text-neutral-500">
              Loading active financial goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-neutral-500 bg-white border-2 border-black p-8">
              No financial goals configured. Click "PROVISION NEW GOAL" to begin tracking.
            </div>
          ) : (
            goals.map((g) => {
              const current = Number(g.current_amount || 0);
              const target = Number(g.target_amount || 1);
              const remaining = Math.max(0, target - current);
              const pct = Math.min(100, Math.round((current / target) * 100));

              // Compute required monthly contribution
              const targetDate = new Date(g.target_date);
              const now = new Date();
              const monthsRemaining = Math.max(
                1,
                (targetDate.getFullYear() - now.getFullYear()) * 12 +
                  (targetDate.getMonth() - now.getMonth())
              );
              const requiredMonthly = (remaining / monthsRemaining).toFixed(0);

              return (
                <div
                  key={g.id}
                  className="bg-white border-2 border-black p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200">
                      <div className="font-heading-tech text-lg font-black text-black">
                        {g.name}
                      </div>
                      <span
                        className={`neo-badge ${
                          g.priority === 'high'
                            ? 'bg-[#FEF2F2] text-red-700 border-red-400'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-400'
                        }`}
                      >
                        {g.priority.toUpperCase()}
                      </span>
                    </div>

                    {/* Progress Numbers */}
                    <div className="space-y-2 mb-4">
                      <div className="text-2xl font-black text-black">
                        {formatINR(current)}{' '}
                        <span className="text-sm text-neutral-500 font-normal">
                          / {formatINR(target)}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-neutral-600">
                        <span>Remaining: <strong>{formatINR(remaining)}</strong></span>
                        <span className="font-bold">{pct}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-3 bg-neutral-100 border border-black overflow-hidden">
                        <div
                          className="h-full bg-[#D4FF00] transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-2.5 bg-[#F7F7F4] border border-neutral-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Target Date:</span>
                        <span className="font-bold">{formatDate(g.target_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Required Monthly:</span>
                        <span className="font-bold text-emerald-800">
                          {formatINR(Number(requiredMonthly))} / mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Timeline Remaining:</span>
                        <span className="font-bold">{monthsRemaining} months</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-neutral-200 text-xs">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 border border-black bg-white hover:bg-neutral-100 font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>EDIT</span>
                    </button>
                    <button
                      onClick={() => setDeletingId(g.id)}
                      className="p-1.5 border border-black bg-white hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'UPDATE FINANCIAL GOAL' : 'PROVISION NEW FINANCIAL GOAL'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-500 text-red-800 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">Goal Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Higher Education, MacBook Pro, Emergency Fund"
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Target Amount (INR)</label>
              <input
                type="number"
                step="1000"
                required
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                placeholder="300000.00"
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none font-bold"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Current Saved (INR)</label>
              <input
                type="number"
                step="1000"
                required
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                placeholder="120000.00"
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Target Date</label>
              <input
                type="date"
                required
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
                }
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
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
              SAVE GOAL
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
          <div className="space-y-4 text-xs">
            <p>Delete this financial goal? Associated progress tracking will be removed.</p>
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
                DELETE GOAL
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
