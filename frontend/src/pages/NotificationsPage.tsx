/**
 * Notification Center Page.
 * Requirement 17: Notifications list, mark as read, mark all read, delete, category filters.
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Bell, Check, CheckCheck, Info, Sparkles, Trash2 } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { formatDate } from '../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.is_read;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6 pb-12 font-mono-tech">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Notifications
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 border-2 border-black bg-white font-bold text-xs uppercase flex items-center gap-1.5 hover:bg-neutral-100 shadow-[1px_1px_0px_#000]"
            >
              <CheckCheck className="w-4 h-4" />
              <span>MARK ALL AS READ</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="TOTAL ALERTS" value={notifications.length} />
        <StatCard label="UNREAD NOTIFICATIONS" value={unreadCount} isAlert={unreadCount > 0} />
        <StatCard label="ACTIVE STATUS" value="DISPATCH ENGINE OK" isSuccess />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'ALL NOTIFICATIONS' },
          { id: 'unread', label: `UNREAD (${unreadCount})` },
          { id: 'budget_alert', label: 'BUDGET WARNINGS' },
          { id: 'unusual_transaction', label: 'UNUSUAL SPEND' },
          { id: 'subscription_due', label: 'SUBSCRIPTIONS' },
          { id: 'insight', label: 'AI INSIGHTS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 border-2 border-black font-bold uppercase text-xs transition-colors ${
              filterType === tab.id
                ? 'bg-[#D4FF00] text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-neutral-500">
            Loading notification events...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 bg-white border-2 border-black text-center text-neutral-500">
            No notifications in this view.
          </div>
        ) : (
          filtered.map((item) => {
            const isUnread = !item.is_read;
            const isWarning = item.type === 'budget_alert' || item.type === 'unusual_transaction';

            return (
              <div
                key={item.id}
                className={`p-4 border-2 border-black shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isUnread
                    ? isWarning
                      ? 'bg-[#FEF08A]/40 border-black'
                      : 'bg-white border-black'
                    : 'bg-[#F7F7F4] opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 border border-black bg-white shrink-0 mt-0.5">
                    {item.type === 'budget_alert' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    ) : item.type === 'unusual_transaction' ? (
                      <AlertCircle className="w-4 h-4 text-red-700" />
                    ) : item.type === 'subscription_due' ? (
                      <Bell className="w-4 h-4 text-indigo-700" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-black" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="neo-badge bg-black text-white text-[9px]">
                        {item.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {isUnread && (
                        <span className="neo-badge bg-[#D4FF00] text-black text-[9px]">
                          NEW
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <h4 className="font-heading-tech text-base font-black text-black">
                      {item.title}
                    </h4>
                    <p className="text-xs text-neutral-700 mt-0.5">{item.message}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="px-2.5 py-1 border border-black bg-white hover:bg-neutral-100 text-xs font-bold uppercase flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>READ</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 border border-black bg-white hover:bg-red-50 text-red-600"
                    title="Delete alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
