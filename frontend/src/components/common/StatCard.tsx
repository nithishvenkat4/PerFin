/**
 * Modern StatCard component styled after the Eduvance template.
 * Features rounded-2xl corners, soft purple/slate borders, and clean typography.
 */

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  isAlert?: boolean;
  isSuccess?: boolean;
  prefix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  isAlert = false,
  isSuccess = false,
  prefix,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200 group">
      <div
        className={`font-heading-tech text-2xl sm:text-3xl font-extrabold tracking-tight ${
          isAlert
            ? 'text-rose-600'
            : isSuccess
            ? 'text-emerald-600'
            : 'text-[#1E1B4B] group-hover:text-[#5E4AE3]'
        } transition-colors`}
      >
        {prefix && <span className="text-xl font-bold mr-0.5">{prefix}</span>}
        {value}
      </div>

      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1.5">
        {label}
      </div>

      {sublabel && (
        <div className="text-[11px] font-medium text-slate-400 mt-0.5">
          {sublabel}
        </div>
      )}
    </div>
  );
};
