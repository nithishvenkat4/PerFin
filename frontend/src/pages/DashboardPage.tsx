/**
 * Main Financial Dashboard Page.
 * Styled after the modern Eduvance (Purple & Amber) SaaS design system.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  CreditCard,
  Target,
  Briefcase,
  AlertTriangle,
  Receipt,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { TerminalBanner } from '../components/common/TerminalBanner';
import { HealthScoreDial } from '../components/common/HealthScoreDial';
import { StatCard } from '../components/common/StatCard';
import { NotificationBanner } from '../components/common/NotificationBanner';
import { api } from '../services/api';
import { AnalyticsSummary, Budget, Goal, Subscription, Transaction } from '../types';
import { formatINR, formatDate, formatPercent } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
  refreshKey?: number;
}

const CATEGORY_COLORS = [
  '#5E4AE3', // Rich Purple
  '#FACC15', // Golden Amber
  '#10B981', // Emerald
  '#0284C7', // Sky
  '#F97316', // Orange
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ refreshKey = 0 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [sumRes, txnRes, goalRes, bgtRes, subRes] = await Promise.all([
          api.getAnalyticsSummary().catch(() => null),
          api.getTransactions({ page: 1, page_size: 8 }).catch(() => ({ items: [] })),
          api.getGoals().catch(() => []),
          api.getBudgets().catch(() => []),
          api.getSubscriptions().catch(() => []),
        ]);

        if (isMounted) {
          setSummary(sumRes);
          setRecentTxns(txnRes.items || []);
          setGoals(goalRes || []);
          setBudgets(bgtRes || []);
          setSubscriptions(subRes || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Derived financial computations
  const totalIncome = summary ? Number(summary.total_income || 0) : 68500;
  const totalExpenses = summary ? Number(summary.total_expenses || 0) : 26348;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '42.5';
  const investmentValue = summary ? Number(summary.total_investments_value || 0) : 88700;
  const emergencyFund = 120000;

  // Chart dataset with Eduvance Purple and Amber
  const cashflowData = [
    { period: 'Jul 2026', Income: 60000, Expenses: 28400 },
    { period: 'Aug 2026', Income: 60000, Expenses: 31200 },
    { period: 'Sep 2026', Income: 68500, Expenses: totalExpenses },
  ];

  const categoryData =
    summary?.category_breakdown && summary.category_breakdown.length > 0
      ? summary.category_breakdown.map((item) => ({
          name: item.category,
          value: Number(item.total_amount),
        }))
      : [
          { name: 'Food', value: 4130 },
          { name: 'Shopping', value: 2450 },
          { name: 'Bills', value: 2849 },
          { name: 'Transport', value: 640 },
          { name: 'Education', value: 2200 },
          { name: 'Entertainment', value: 649 },
        ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Command Search & Quick Analysis Bar */}
      <TerminalBanner />

      {/* 2. User Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
            {user?.name || 'Aarav Sharma'}
          </h1>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 font-medium">
            <span className="text-slate-600">{user?.email || 'demo@finmate.local'}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Active Account
            </span>
          </div>
        </div>

        {/* Right Score Block */}
        <div className="rounded-2xl border border-slate-200 p-4 sm:px-6 bg-purple-50/50 flex items-center gap-4">
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400">
              Financial Health
            </div>
            <div className="font-heading-tech text-3xl sm:text-4xl font-extrabold text-[#1E1B4B]">
              78<span className="text-lg text-slate-400 font-normal"> / 100</span>
            </div>
            <div className="text-xs font-bold text-[#5E4AE3]">
              Optimal Health
            </div>
          </div>
        </div>
      </div>

      {/* 3. System Notification Toast */}
      <NotificationBanner
        title="BUDGET ADVISORY NOTIFICATION"
        message="Food & Dining spending reached 68% of monthly allocation. Fixed obligations remain fully collateralized."
        type="warning"
      />

      {/* 4. Stat Cards Grid (Eduvance Rounded-2xl Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard label="TOTAL INCOME" value={formatINR(totalIncome)} isSuccess />
        <StatCard label="TOTAL EXPENSES" value={formatINR(totalExpenses)} />
        <StatCard label="NET SAVINGS" value={formatINR(netSavings)} isSuccess />
        <StatCard label="SAVINGS RATE" value={`${savingsRate}%`} isSuccess />
        <StatCard label="INVESTMENTS" value={formatINR(investmentValue)} />
        <StatCard label="EMERGENCY FUND" value={formatINR(emergencyFund)} isSuccess />
      </div>

      {/* 5. Core Operational Grid: Charts & Health Dial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & Middle: Charts (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income vs Expense Cashflow Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading-tech text-lg font-bold text-[#1E1B4B]">
                  Income & Expenses
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#5E4AE3] inline-block"></span> Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FACC15] inline-block"></span> Expenses
                </span>
              </div>
            </div>

            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="period" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => formatINR(Number(val))}
                  />
                  <Bar dataKey="Income" fill="#5E4AE3" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#FACC15" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Spending Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading-tech text-lg font-bold text-[#1E1B4B]">
                  Category Spending
                </h3>
              </div>
              <button
                onClick={() => navigate('/expenses')}
                className="text-xs font-bold text-[#5E4AE3] hover:text-[#4D38D0] flex items-center gap-1"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => formatINR(Number(val))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs">
                {categoryData.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      ></span>
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#1E1B4B]">{formatINR(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Health Score Dial & Upcoming Commitments */}
        <div className="space-y-6">
          {/* Health Score Dial */}
          <HealthScoreDial
            score={78}
            savingsRate={Number(savingsRate)}
            flagCount={0}
            emergencyMonths={4.8}
          />

          {/* Active Category Budgets Alert List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B]">
                Budget Utilization
              </h3>
              <button
                onClick={() => navigate('/budgets')}
                className="text-xs font-bold text-[#5E4AE3] hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {budgets.slice(0, 4).map((b) => {
                const pct = b.percentage_used || 0;
                const isOver = pct >= 100;
                const isWarn = pct >= (b.alert_threshold || 80);
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">{b.category}</span>
                      <span className={isOver ? 'text-rose-600 font-bold' : isWarn ? 'text-amber-600 font-bold' : 'text-slate-500 font-medium'}>
                        {formatINR(Number(b.spent))} / {formatINR(Number(b.amount))} ({pct}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : isWarn ? 'bg-amber-400' : 'bg-[#5E4AE3]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Payments Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B]">
                Upcoming Payments
              </h3>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-bold text-[#5E4AE3] hover:underline"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {subscriptions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[#1E1B4B]">{sub.name}</div>
                    <div className="text-[11px] text-slate-400">Due {formatDate(sub.next_billing_date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[#1E1B4B]">{formatINR(Number(sub.amount))}</div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                      {sub.billing_frequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="font-heading-tech text-lg font-bold text-[#1E1B4B]">
              Recent Transactions
            </h3>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="px-4 py-2 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-500/20 w-fit"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTxns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentTxns.slice(0, 6).map((tx) => (
                  <tr key={tx.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-medium">{formatDate(tx.transaction_date)}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{tx.description}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {tx.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.transaction_type === 'income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.transaction_type.toUpperCase()}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        tx.transaction_type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {tx.transaction_type === 'income' ? '+' : '-'} {formatINR(Number(tx.amount))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
