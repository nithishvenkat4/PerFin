/**
 * Financial Calendar Interface.
 * Requirement 16: Display salary dates, recurring payments, subscription renewals, goal deadlines, budget periods.
 */

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, DollarSign, Target, Bell, Info } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { Goal, Income, RecurringPayment, Subscription } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'salary' | 'recurring' | 'subscription' | 'goal';
  amount?: number | string;
  details?: string;
}

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Month navigation
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [incomes, subscriptions, recurring, goals] = await Promise.all([
          api.getIncomes().catch(() => []),
          api.getSubscriptions().catch(() => []),
          api.getRecurringPayments().catch(() => []),
          api.getGoals().catch(() => []),
        ]);

        const allEvents: CalendarEvent[] = [];

        // Incomes
        incomes.forEach((inc) => {
          allEvents.push({
            id: `inc-${inc.id}`,
            title: `Income: ${inc.source}`,
            date: inc.date,
            type: 'salary',
            amount: inc.amount,
            details: inc.description || `${inc.frequency} disbursement`,
          });
        });

        // Subscriptions
        subscriptions.forEach((sub) => {
          allEvents.push({
            id: `sub-${sub.id}`,
            title: `Sub: ${sub.name}`,
            date: sub.next_billing_date,
            type: 'subscription',
            amount: sub.amount,
            details: `Provider: ${sub.provider} (${sub.billing_frequency})`,
          });
        });

        // Recurring
        recurring.forEach((rec) => {
          allEvents.push({
            id: `rec-${rec.id}`,
            title: `Bill: ${rec.name}`,
            date: rec.next_due_date,
            type: 'recurring',
            amount: rec.amount,
            details: `Category: ${rec.category} (${rec.frequency})`,
          });
        });

        // Goals
        goals.forEach((g) => {
          allEvents.push({
            id: `goal-${g.id}`,
            title: `Target: ${g.name}`,
            date: g.target_date,
            type: 'goal',
            amount: g.target_amount,
            details: `Target: ${formatINR(Number(g.target_amount))} (Priority: ${g.priority})`,
          });
        });

        setEvents(allEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const formattedDay = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === formattedDay);
  };

  return (
    <div className="space-y-6 pb-12 font-mono-tech">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Calendar
          </h1>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1.5 border-2 border-black bg-white uppercase font-bold hover:bg-neutral-100 shadow-[1px_1px_0px_#000]"
          >
            &lt; PREV
          </button>
          <div className="px-4 py-1.5 border-2 border-black bg-[#D4FF00] font-black uppercase text-sm shadow-[1px_1px_0px_#000]">
            {monthNames[currentMonth]} {currentYear}
          </div>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1.5 border-2 border-black bg-white uppercase font-bold hover:bg-neutral-100 shadow-[1px_1px_0px_#000]"
          >
            NEXT &gt;
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white border-2 border-black text-xs font-bold">
        <span className="text-neutral-500 uppercase mr-1">EVENT TYPES:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-emerald-500 border border-black inline-block"></span> Salary / Revenue
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-indigo-500 border border-black inline-block"></span> Subscriptions
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-amber-500 border border-black inline-block"></span> Recurring Bills
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-purple-500 border border-black inline-block"></span> Goal Deadlines
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b-2 border-black bg-[#F4F4F0] text-center text-xs font-black uppercase py-2">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 p-1.5 bg-[#F9F9F7]" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = getEventsForDay(dayNum);
            return (
              <div
                key={`day-${dayNum}`}
                className="min-h-24 p-1.5 bg-white hover:bg-neutral-50 flex flex-col justify-between border-b border-neutral-200"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-black">{dayNum}</span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-neutral-500 font-normal">
                      {dayEvents.length} items
                    </span>
                  )}
                </div>

                {/* Event Tags */}
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 3).map((e) => {
                    const tagBg =
                      e.type === 'salary'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                        : e.type === 'subscription'
                        ? 'bg-indigo-100 text-indigo-950 border-indigo-400'
                        : e.type === 'recurring'
                        ? 'bg-amber-100 text-amber-950 border-amber-400'
                        : 'bg-purple-100 text-purple-950 border-purple-400';

                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setSelectedEvent(e)}
                        className={`w-full text-left truncate p-1 border text-[10px] font-bold block ${tagBg}`}
                      >
                        {e.title}
                      </button>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[9px] text-neutral-500 text-center font-bold">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Event Detail Modal (Requirement 16) */}
      {selectedEvent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
          title="CALENDAR EVENT DETAILS"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="font-heading-tech text-base font-black text-black uppercase">
                {selectedEvent.title}
              </span>
              <span className="neo-badge bg-[#D4FF00] text-black">
                {selectedEvent.type.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Scheduled Date:</span>
              <span className="font-bold text-black">{formatDate(selectedEvent.date)}</span>
            </div>

            {selectedEvent.amount !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Monetary Value:</span>
                <span className="text-base font-black text-black">
                  {formatINR(Number(selectedEvent.amount))}
                </span>
              </div>
            )}

            {selectedEvent.details && (
              <div className="p-3 bg-[#F7F7F4] border border-black mt-2">
                <div className="text-[10px] text-neutral-500 font-bold uppercase mb-1">
                  EVENT SPECIFICATION:
                </div>
                <div>{selectedEvent.details}</div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 border-2 border-black bg-[#D4FF00] font-bold uppercase shadow-[1px_1px_0px_#000]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
