/**
 * Modern Tab Navigation component styled after the Eduvance template.
 */

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabNavProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (id: string) => void;
}

export const TabNav: React.FC<TabNavProps> = ({ tabs, activeTab, onSelectTab }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              isActive
                ? 'bg-[#5E4AE3] text-white shadow-sm shadow-purple-500/25'
                : 'bg-white text-slate-600 hover:bg-purple-50/60 hover:text-[#5E4AE3] border border-slate-200/80'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
