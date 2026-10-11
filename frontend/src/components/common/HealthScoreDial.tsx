/**
 * Deterministic Financial Health Score Dial Component.
 * Styled after the modern Eduvance (Purple & Amber) SaaS design system.
 */

import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface FactorItem {
  delta: number;
  label: string;
}

interface HealthScoreDialProps {
  score?: number;
  savingsRate?: number;
  flagCount?: number;
  emergencyMonths?: number;
}

export const HealthScoreDial: React.FC<HealthScoreDialProps> = ({
  score = 78,
  savingsRate = 42.5,
  flagCount = 0,
  emergencyMonths = 4.2,
}) => {
  const factors: FactorItem[] = [
    { delta: 14, label: 'High positive savings rate (>30%)' },
    { delta: 10, label: 'Emergency fund buffer (>4 months active)' },
    { delta: -4, label: 'Discretionary shopping spike in week 1' },
    { delta: -2, label: 'Single subscription renewal approaching' },
  ];

  const radius = 64;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const isHealthy = score >= 70;
  const statusLabel = isHealthy ? 'OPTIMAL / LOW RISK' : 'CAUTION REQUIRED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-heading-tech text-base font-bold text-[#1E1B4B]">
          Financial Health
        </h3>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
      </div>

      {/* Center Gauge and Score */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
            <circle
              stroke="#EDE9FE"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="#5E4AE3"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-heading-tech text-4xl font-extrabold text-[#1E1B4B]">
              {score}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              OUT OF 100
            </span>
          </div>
        </div>

        {/* Status Pill matching Eduvance button style */}
        <div
          className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isHealthy
              ? 'bg-[#FEF9C3] text-[#854D0E] border border-[#FACC15]'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {isHealthy ? (
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Telemetry Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50/80 rounded-xl border border-slate-100 text-center mb-4">
        <div>
          <div className="text-sm font-extrabold text-[#1E1B4B]">{savingsRate}%</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase">SAVINGS RATE</div>
        </div>
        <div className="border-x border-slate-200">
          <div className="text-sm font-extrabold text-[#1E1B4B]">{flagCount}</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase">ANOMALIES</div>
        </div>
        <div>
          <div className="text-sm font-extrabold text-[#1E1B4B]">{emergencyMonths}M</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase">RUNWAY BUFFER</div>
        </div>
      </div>

      {/* Deterministic Breakdown List */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Score Factors
        </div>
        {factors.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100"
          >
            <span className="text-slate-600 truncate mr-2">{f.label}</span>
            <span
              className={`font-bold shrink-0 text-xs px-1.5 py-0.2 rounded-md ${
                f.delta > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {f.delta > 0 ? `+${f.delta}` : f.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
