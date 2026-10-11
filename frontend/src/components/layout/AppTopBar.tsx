/**
 * Sleek Top Bar for FinMate 2.0.
 * Houses breadcrumbs, search, engine telemetry pill, quick refresh, and mobile toggle.
 */

import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, RefreshCw, Bell, Search, Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppTopBarProps {
  onToggleMobileSidebar: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ROUTE_TITLES: Record<string, { group: string; title: string }> = {
  '/dashboard': { group: 'Overview', title: 'Dashboard' },
  '/analytics': { group: 'Overview', title: 'Analytics' },
  '/calendar': { group: 'Overview', title: 'Calendar' },
  '/transactions': { group: 'Cash Flow', title: 'Transactions' },
  '/income': { group: 'Cash Flow', title: 'Income' },
  '/expenses': { group: 'Cash Flow', title: 'Expenses' },
  '/budgets': { group: 'Planning', title: 'Budgets' },
  '/goals': { group: 'Planning', title: 'Goals' },
  '/investments': { group: 'Planning', title: 'Investments' },
  '/subscriptions': { group: 'Planning', title: 'Subscriptions' },
  '/advisor': { group: 'Tools', title: 'AI Advisor' },
  '/simulator': { group: 'Tools', title: 'What-If Simulator' },
  '/imports': { group: 'Tools', title: 'Statements' },
  '/notes': { group: 'Tools', title: 'Notes' },
  '/notifications': { group: 'Account', title: 'Notifications' },
  '/profile': { group: 'Account', title: 'Profile' },
  '/admin': { group: 'Admin', title: 'Operations Console' },
};

export const AppTopBar: React.FC<AppTopBarProps> = ({
  onToggleMobileSidebar,
  onRefresh,
  isRefreshing = false,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentRouteInfo = ROUTE_TITLES[location.pathname] || {
    group: 'PerFin',
    title: 'Financial Workspace',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        {/* Left: Mobile Menu Toggle + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="font-heading-tech text-base sm:text-lg font-bold text-slate-900 truncate">
              {currentRouteInfo.title}
            </h1>
          </div>
        </div>

        {/* Center / Search shortcut */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions, budgets, or simulate purchase..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  navigate(`/transactions?search=${encodeURIComponent(e.currentTarget.value.trim())}`);
                }
              }}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5E4AE3] focus:ring-2 focus:ring-[#5E4AE3]/15 transition-all"
            />
          </div>
        </div>

        {/* Right: Refresh, notifications, role pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Refresh Data */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh ledger and analytics"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#5E4AE3]' : ''}`} />
            </button>
          )}

          {/* Notifications Icon Button */}
          <Link
            to="/notifications"
            title="Notifications"
            className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
          </Link>

          {/* Role Status Pill (Eduvance style) */}
          {isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              <span>ADMIN</span>
            </Link>
          ) : (
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 hover:bg-emerald-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>USER</span>
            </Link>
          )}

          {/* Sign Out Button */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out of PerFin"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
