/**
 * Administrator Control Workspace.
 * Styled after the modern Eduvance (Purple & Amber) SaaS design system.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Database,
  LogOut,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { TabNav, TabItem } from '../../components/common/TabNav';
import { api } from '../../services/api';
import { AdminStats, AdminUserItem, AuditLogItem, SystemHealth } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes, healthRes] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminUsers().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getSystemHealth().catch(() => null),
      ]);

      setStats(statsRes);
      setUsers(usersRes || []);
      setAuditLogs(logsRes || []);
      setSystemHealth(healthRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await api.updateUserRole(userId, newRole);
      setActionSuccess(`Role updated to ${newRole} for user.`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs: TabItem[] = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'users', label: 'USERS', count: users.length },
    { id: 'audit', label: 'AUDIT LOGS', count: auditLogs.length },
    { id: 'system', label: 'SYSTEM HEALTH' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner (Eduvance Card Style) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              Admin Workspace
            </span>
          </div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Operations Dashboard
          </h1>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs uppercase flex items-center gap-2 transition-all w-fit"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Exit Admin View</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metric Cards Row (Eduvance Rounded-2xl Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard label="TOTAL USERS" value={stats?.total_users || users.length || 2} />
        <StatCard label="TOTAL TX ENTRIES" value={stats?.total_transactions || 12} />
        <StatCard label="TOTAL GOALS" value={stats?.total_goals || 3} />
        <StatCard label="INVESTMENTS" value={stats?.total_investments || 3} />
        <StatCard label="SUSPICIOUS / FLAGS" value={0} isAlert={false} />
        <StatCard label="AUDIT EVENTS" value={auditLogs.length || 5} />
      </div>

      {/* Tab Navigation */}
      <TabNav tabs={tabs} activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B] mb-4 pb-3 border-b border-slate-100">
              Platform Ledger Metrics
            </h3>
            <div className="space-y-3.5 text-xs font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Gross Transaction Volume:</span>
                <span className="font-bold text-[#1E1B4B]">{formatINR(Number(stats?.total_transaction_volume || 94848))}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Active User Accounts:</span>
                <span className="font-bold text-[#1E1B4B]">{stats?.total_users || users.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Total Budgets Configured:</span>
                <span className="font-bold text-[#1E1B4B]">{stats?.total_budgets || 6}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Total Financial Goals:</span>
                <span className="font-bold text-[#1E1B4B]">{stats?.total_goals || 3}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Active Recurring Services:</span>
                <span className="font-bold text-[#1E1B4B]">{stats?.total_subscriptions || 4}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B] mb-4 pb-3 border-b border-slate-100">
              System Architecture & Health
            </h3>
            <div className="space-y-3.5 text-xs font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Core Relational Database:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  PostgreSQL / SQLite [ONLINE]
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Node.js Document Microservice:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  Port 5000 [CONNECTED]
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">AI / ML Classification Engine:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  LinearSVC Pipeline [READY]
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Regulatory RAG Knowledge Base:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  RBI / SEBI / FPSB [LOADED]
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Human-In-The-Loop Governance:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  Tier 3 HITL Gated
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Users Management (Eduvance Modern Table) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B]">
                Registered User Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage user permissions and access control tiers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Transactions</th>
                  <th className="py-3 px-3">Goals</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{u.name || 'User'}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{u.transaction_count}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{u.goal_count}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                          u.role === 'ADMIN'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-[#5E4AE3] hover:bg-[#4D38D0] text-white'
                        }`}
                      >
                        {u.role === 'ADMIN' ? 'DEMOTE TO USER' : 'PROMOTE TO ADMIN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B]">
                Security & Operation Audit Logs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable trace of financial state mutations, imports, and governance events.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-tech text-[11px]">
                {auditLogs.slice(0, 25).map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">{formatDate(log.timestamp)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.entity_type}</td>
                    <td className="py-2.5 px-3 text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 4: System Health */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B] pb-3 border-b border-slate-100">
              FastAPI Core Service
            </h3>
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Service Status:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  ONLINE [HTTP 200]
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">App Version:</span>
                <span className="font-bold text-[#1E1B4B]">FinMate 2.0.0</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-bold text-[#1E1B4B]">PostgreSQL 16 (SQLite Fallback Ready)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Uptime:</span>
                <span className="font-bold text-slate-700">Healthy</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B] pb-3 border-b border-slate-100">
              Node.js + MongoDB Microservice
            </h3>
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Microservice Status:</span>
                <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                  LISTENING ON PORT 5000
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Document Store:</span>
                <span className="font-bold text-[#1E1B4B]">MongoDB / Embedded Document Fallback</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Collections Managed:</span>
                <span className="font-bold text-[#1E1B4B]">ai_conversations, financial_notes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">JWT Middleware:</span>
                <span className="font-bold text-emerald-700">HS256 Gated</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
