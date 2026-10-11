/**
 * Left-Side Vertical Navigation Sidebar with Grouped Categories.
 * Styled after the modern Eduvance (Purple & Amber) SaaS design system.
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Receipt,
  TrendingUp,
  CreditCard,
  PieChart,
  Target,
  Briefcase,
  RefreshCw,
  Sparkles,
  Compass,
  UploadCloud,
  Database,
  Bell,
  User,
  Shield,
  LogOut,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  unreadNotifications?: number;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: 'amber' | 'purple' | 'slate';
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
  unreadNotifications = 0,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Calendar', path: '/calendar', icon: Calendar },
      ],
    },
    {
      groupTitle: 'CASH FLOW',
      items: [
        { label: 'Transactions', path: '/transactions', icon: Receipt },
        { label: 'Income', path: '/income', icon: TrendingUp },
        { label: 'Expenses', path: '/expenses', icon: CreditCard },
      ],
    },
    {
      groupTitle: 'PLANNING & WEALTH',
      items: [
        { label: 'Budgets', path: '/budgets', icon: PieChart },
        { label: 'Goals', path: '/goals', icon: Target },
        { label: 'Investments', path: '/investments', icon: Briefcase },
        { label: 'Subscriptions', path: '/subscriptions', icon: RefreshCw },
      ],
    },
    {
      groupTitle: 'TOOLS & INSIGHTS',
      items: [
        { label: 'AI Advisor', path: '/advisor', icon: Sparkles },
        { label: 'What-If Simulator', path: '/simulator', icon: Compass },
        { label: 'Import Statements', path: '/imports', icon: UploadCloud },
        { label: 'Notes', path: '/notes', icon: Database },
      ],
    },
    {
      groupTitle: 'SYSTEM & SETTINGS',
      items: [
        {
          label: 'Notifications',
          path: '/notifications',
          icon: Bell,
          badge: unreadNotifications > 0 ? String(unreadNotifications) : undefined,
          badgeColor: 'amber',
        },
        { label: 'Profile & Settings', path: '/profile', icon: User },
        ...(isAdmin
          ? [
              {
                label: 'Admin Workspace',
                path: '/admin',
                icon: Shield,
                badge: 'ADMIN',
                badgeColor: 'purple' as const,
              },
            ]
          : []),
      ],
    },
  ];

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand & Logo Header */}
      <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
        <NavLink
          to="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-3 group"
        >
          {/* Eduvance-style Stylized Emblem */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5E4AE3] to-[#7B68EE] flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div>
            <span className="font-heading-tech text-xl font-bold text-[#1E1B4B] tracking-tight">
              PerFin
            </span>
          </div>
        </NavLink>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => {
            navigate('/transactions?action=new');
            handleNavClick();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#1E1B4B] font-bold text-xs shadow-sm shadow-amber-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>NEW TRANSACTION</span>
        </button>
      </div>

      {/* Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {group.groupTitle}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#5E4AE3] text-white shadow-sm shadow-purple-500/20'
                          : 'text-slate-600 hover:bg-purple-50/70 hover:text-[#5E4AE3]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#5E4AE3]'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor === 'amber'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-purple-100 text-purple-900 border border-purple-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Card & Sign Out */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5E4AE3] to-[#8B5CF6] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'USER'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out of PerFin"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="w-64 border-r border-slate-200/80 bg-white hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
