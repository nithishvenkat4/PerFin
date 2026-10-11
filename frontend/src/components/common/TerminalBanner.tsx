/**
 * Decision Intelligence Command Bar styled after the Eduvance template.
 * Features quick simulation shortcuts, search, and instant analysis.
 */

import React, { useState } from 'react';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TerminalBannerProps {
  onSearch?: (query: string) => void;
  defaultQuery?: string;
  placeholder?: string;
}

export const TerminalBanner: React.FC<TerminalBannerProps> = ({
  onSearch,
  defaultQuery = '',
  placeholder = 'Query transaction descriptions, evaluate budgets, or simulate purchase decisions...',
}) => {
  const [query, setQuery] = useState(defaultQuery);
  const navigate = useNavigate();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else if (query.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(query)}`);
    }
  };

  const handleShortcutClick = (term: string, targetPath?: string) => {
    setQuery(term);
    if (targetPath) {
      navigate(targetPath);
    } else if (onSearch) {
      onSearch(term);
    }
  };

  return (
    <div className="w-full mb-6">
      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs hover:border-purple-200 transition-all">
        <form
          onSubmit={handleAnalyze}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="flex-1 flex items-center px-3 py-2 gap-3 w-full">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions, budgets, or ask financial questions..."
              className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#1E1B4B] font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20 active:scale-[0.98] transition-all shrink-0"
          >
            <span>SEARCH</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-3 flex items-center gap-2 flex-wrap px-1">
        <span className="text-[11px] font-semibold text-slate-400">
          Try asking:
        </span>

        <button
          onClick={() => handleShortcutClick('Can I afford a ₹40,000 laptop?', '/advisor')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-purple-50 text-slate-600 hover:text-[#5E4AE3] border border-slate-200 hover:border-purple-200 transition-all"
        >
          Can I afford a ₹40,000 laptop?
        </button>

        <button
          onClick={() => handleShortcutClick('Food & Dining', '/transactions')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-purple-50 text-slate-600 hover:text-[#5E4AE3] border border-slate-200 hover:border-purple-200 transition-all"
        >
          Food & Dining expenses
        </button>

        <button
          onClick={() => handleShortcutClick('Subscriptions', '/subscriptions')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-purple-50 text-slate-600 hover:text-[#5E4AE3] border border-slate-200 hover:border-purple-200 transition-all"
        >
          Monthly subscriptions
        </button>
      </div>
    </div>
  );
};
