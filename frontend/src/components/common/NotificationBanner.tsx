/**
 * Modern Notification Banner styled after the Eduvance template.
 */

import React from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle, X } from 'lucide-react';

interface NotificationBannerProps {
  title?: string;
  message: string;
  type?: 'warning' | 'info' | 'error' | 'success';
  onDismiss?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  title = 'System Notification',
  message,
  type = 'warning',
  onDismiss,
}) => {
  const styles =
    type === 'warning'
      ? {
          bg: 'bg-amber-50 border-amber-200/80 text-amber-950',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          pill: 'bg-amber-100 text-amber-900',
        }
      : type === 'error'
      ? {
          bg: 'bg-rose-50 border-rose-200/80 text-rose-950',
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          pill: 'bg-rose-100 text-rose-900',
        }
      : type === 'success'
      ? {
          bg: 'bg-purple-50 border-purple-200/80 text-purple-950',
          icon: <CheckCircle2 className="w-5 h-5 text-[#5E4AE3] shrink-0" />,
          pill: 'bg-purple-100 text-purple-900',
        }
      : {
          bg: 'bg-slate-50 border-slate-200/80 text-slate-900',
          icon: <Info className="w-5 h-5 text-slate-600 shrink-0" />,
          pill: 'bg-slate-100 text-slate-900',
        };

  return (
    <div
      className={`rounded-2xl border p-4 mb-4 flex items-start justify-between gap-3 shadow-xs ${styles.bg}`}
    >
      <div className="flex items-start gap-3">
        {styles.icon}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {title}
            </span>
          </div>
          <div className="text-xs mt-0.5 opacity-90 leading-relaxed font-medium">
            {message}
          </div>
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors text-slate-500"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
