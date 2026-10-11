/**
 * Top Navigation Header matching the Technical Cyber-Brutalist Aesthetic.
 * Visual source of truth: Screenshot 1 & 3.
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, LogIn, LogOut, RefreshCw, Shield, User } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'DASHBOARD', path: '/dashboard' },
    { label: 'TRANSACTIONS', path: '/transactions' },
    { label: 'BUDGETS', path: '/budgets' },
    { label: 'GOALS', path: '/goals' },
    { label: 'INVESTMENTS', path: '/investments' },
    { label: 'SUBSCRIPTIONS', path: '/subscriptions' },
    { label: 'CALENDAR', path: '/calendar' },
    { label: 'ANALYTICS', path: '/analytics' },
    { label: 'AI ADVISOR', path: '/advisor' },
    { label: 'SIMULATOR', path: '/simulator' },
    { label: 'IMPORTS', path: '/imports' },
    { label: 'NOTES & CHAT', path: '/notes' },
  ];

  return (
    <header className="w-full bg-[#F7F7F4] border-b-2 border-black sticky top-0 z-50">
      <div className="max-w-[1500px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Version Badge */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-1.5 group">
            <span className="font-heading-tech text-2xl font-black tracking-tight text-black">
              FINMATE
            </span>
            <span className="w-2.5 h-2.5 bg-[#D4FF00] border-2 border-black inline-block rounded-full ml-0.5"></span>
          </Link>

          <div className="hidden sm:inline-flex items-center px-2 py-0.5 border border-black bg-white text-[10px] font-mono-tech uppercase font-bold tracking-wider">
            DECISION ENGINE V2.0
          </div>
        </div>

        {/* Primary Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-[11px] font-mono-tech font-bold uppercase tracking-wider text-neutral-800">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2 py-1 transition-colors border border-transparent ${
                  isActive
                    ? 'border-black bg-black text-white'
                    : 'hover:border-black hover:bg-neutral-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Elements */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Data"
              className="p-1.5 border border-black bg-white hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Role Status Pills (Matching Screenshot 3) */}
          {isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono-tech font-bold uppercase border border-black bg-[#CCFBF1] text-teal-950 hover:bg-[#99F6E4] transition-colors"
            >
              <Shield className="w-3 h-3 text-teal-800" />
              <span>ADMIN [ACTIVE]</span>
            </Link>
          ) : (
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono-tech font-bold uppercase border border-black bg-[#DCFCE7] text-emerald-950 hover:bg-[#BBF7D0] transition-colors"
            >
              <User className="w-3 h-3 text-emerald-800" />
              <span>USER [ACTIVE]</span>
            </Link>
          )}

          {/* Quick Primary Action Button (Matching Screenshot 1 "CHECK A COMPANY ->") */}
          <button
            onClick={() => navigate('/transactions?action=new')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white font-mono-tech font-bold text-xs uppercase hover:bg-neutral-100 shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span>NEW TX</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* User / Logout */}
          {user ? (
            <button
              onClick={logout}
              title={`Logged in as ${user.email}. Click to logout.`}
              className="p-1.5 border border-black bg-white hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              to="/login"
              className="px-2.5 py-1 border border-black bg-[#D4FF00] font-mono-tech font-bold text-xs uppercase inline-flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              <span>LOGIN</span>
            </Link>
          )}
        </div>
      </div>

      {/* Responsive Secondary Subnav for Tablets & Mobile */}
      <div className="xl:hidden overflow-x-auto flex items-center gap-1 px-4 py-1.5 border-t border-black bg-neutral-100 text-[10px] font-mono-tech font-bold uppercase whitespace-nowrap">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-2 py-0.5 border ${
                isActive ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white text-neutral-800'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            className="px-2 py-0.5 border border-teal-600 bg-teal-100 text-teal-900 font-bold"
          >
            ADMIN WORKSPACE
          </Link>
        )}
      </div>
    </header>
  );
};
