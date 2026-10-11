/**
 * Subscription Management Module.
 * Requirement 15: Monthly & Annual cost calculations, active subscriptions, renewals, full CRUD.
 */

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, CreditCard, CheckCircle2, PauseCircle } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { api } from '../services/api';
import { Subscription } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

const CATEGORIES = ['Entertainment', 'Productivity', 'Shopping', 'Cloud', 'Fitness', 'Utilities', 'Other'];

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    amount: '',
    billing_frequency: 'Monthly' as 'Monthly' | 'Yearly',
    next_billing_date: new Date().toISOString().split('T')[0],
    category: 'Entertainment',
    status: 'Active' as 'Active' | 'Paused' | 'Cancelled',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubscriptions();
      setSubscriptions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleOpenAdd = () => {
    setEditingSub(null);
    setFormData({
      name: '',
      provider: '',
      amount: '',
      billing_frequency: 'Monthly',
      next_billing_date: new Date().toISOString().split('T')[0],
      category: 'Entertainment',
      status: 'Active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setFormData({
      name: sub.name,
      provider: sub.provider,
      amount: String(sub.amount),
      billing_frequency: sub.billing_frequency,
      next_billing_date: sub.next_billing_date,
      category: sub.category,
      status: sub.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Subscription amount must be greater than 0.');
      return;
    }

    try {
      if (editingSub) {
        await api.updateSubscription(editingSub.id, {
          name: formData.name.trim(),
          provider: formData.provider.trim(),
          amount: amt,
          billing_frequency: formData.billing_frequency,
          next_billing_date: formData.next_billing_date,
          category: formData.category,
          status: formData.status,
        });
      } else {
        await api.createSubscription({
          name: formData.name.trim(),
          provider: formData.provider.trim(),
          amount: amt,
          billing_frequency: formData.billing_frequency,
          next_billing_date: formData.next_billing_date,
          category: formData.category,
          status: formData.status,
        });
      }
      setIsModalOpen(false);
      fetchSubscriptions();
    } catch (err: any) {
      setFormError(err.message || 'Error saving subscription.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSubscription(id);
      setDeletingId(null);
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const monthlyCost = activeSubs.reduce((acc, curr) => acc + Number(curr.monthly_equivalent || curr.amount), 0);
  const annualCost = monthlyCost * 12;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Subscriptions
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs uppercase flex items-center gap-2 shadow-sm shadow-purple-500/20 active:scale-[0.98] transition-all w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>ADD SUBSCRIPTION</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="MONTHLY RUN RATE" value={formatINR(monthlyCost)} />
        <StatCard label="ANNUALIZED COST" value={formatINR(annualCost)} />
        <StatCard label="ACTIVE SUBSCRIPTIONS" value={activeSubs.length} isSuccess />
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center font-mono-tech text-neutral-500">
            Loading subscriptions...
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="col-span-3 py-12 text-center font-mono-tech text-neutral-500 bg-white border-2 border-black p-8">
            No subscriptions tracked. Click "ADD SUBSCRIPTION" to start tracking.
          </div>
        ) : (
          subscriptions.map((sub) => {
            const isActive = sub.status === 'Active';
            return (
              <div
                key={sub.id}
                className="bg-white border-2 border-black p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200">
                    <div>
                      <div className="font-heading-tech text-lg font-black text-black">
                        {sub.name}
                      </div>
                      <div className="font-mono-tech text-[10px] text-neutral-500 uppercase font-bold">
                        {sub.provider}
                      </div>
                    </div>
                    <span
                      className={`neo-badge ${
                        isActive
                          ? 'bg-[#DCFCE7] text-emerald-950 border-emerald-500'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="space-y-2 font-mono-tech text-xs my-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Amount:</span>
                      <span className="text-xl font-black text-black">
                        {formatINR(Number(sub.amount))}{' '}
                        <span className="text-xs font-normal text-neutral-500">
                          /{sub.billing_frequency.toLowerCase()}
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Category:</span>
                      <span className="font-bold text-black">{sub.category}</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Next Renewal:</span>
                      <span className="font-bold text-black">{formatDate(sub.next_billing_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-200 font-mono-tech text-xs">
                  <span className="text-[10px] text-neutral-500 uppercase">
                    Monthly eq: {formatINR(Number(sub.monthly_equivalent || sub.amount))}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-1.5 border border-black bg-white hover:bg-neutral-100 font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>EDIT</span>
                    </button>
                    <button
                      onClick={() => setDeletingId(sub.id)}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSub ? 'EDIT SUBSCRIPTION' : 'ADD SUBSCRIPTION'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-500 text-red-800 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Netflix Premium"
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Provider</label>
              <input
                type="text"
                required
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Netflix Inc."
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              />
            </div>
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
                placeholder="649.00"
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none font-bold"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Billing Frequency</label>
              <select
                value={formData.billing_frequency}
                onChange={(e) =>
                  setFormData({ ...formData, billing_frequency: e.target.value as 'Monthly' | 'Yearly' })
                }
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Next Renewal Date</label>
              <input
                type="date"
                required
                value={formData.next_billing_date}
                onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-neutral-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-neutral-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as 'Active' | 'Paused' | 'Cancelled' })
              }
              className="w-full border-2 border-black px-3 py-2 bg-white outline-none"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Cancelled">Cancelled</option>
            </select>
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
              SAVE SUBSCRIPTION
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
            <p>Remove this subscription? It will be excluded from recurring run rates.</p>
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
