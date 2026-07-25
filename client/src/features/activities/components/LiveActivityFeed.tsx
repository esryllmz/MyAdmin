import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Activity, Power, Settings2, ShieldCheck, Sparkles, Trash2, UserPlus } from "lucide-react";
import { formatRelativeTime } from "@/core/utils/formatRelativeTime";
import type { RootState } from "@/core/store/store";
import type { ActivityEventType } from "../store/activityFeedSlice";

const EVENT_ICONS: Record<ActivityEventType, typeof ShieldCheck> = {
  "role-change": ShieldCheck,
  "status-toggle": Power,
  "user-delete": Trash2,
  "demo-role-switch": Sparkles,
  "user-invite": UserPlus,
  "role-create": ShieldCheck,
  "settings-update": Settings2,
  "system-health": Activity,
};

const EVENT_COLORS: Record<ActivityEventType, string> = {
  "role-change": "text-on-surface bg-on-surface/10 dark:text-dark-on-surface dark:bg-dark-on-surface/10",
  "status-toggle": "text-warning bg-warning/10",
  "user-delete": "text-error bg-error/10",
  "demo-role-switch": "text-info bg-info/10",
  "user-invite": "text-success bg-success/10",
  "role-create": "text-on-surface bg-on-surface/10 dark:text-dark-on-surface dark:bg-dark-on-surface/10",
  "settings-update": "text-on-surface-variant bg-on-surface-variant/10 dark:text-dark-on-surface-variant dark:bg-dark-on-surface-variant/10",
  "system-health": "text-info bg-info/10",
};

const VISIBLE_EVENT_COUNT = 5;
const MIN_ROW_COUNT = 3;

export const LiveActivityFeed = () => {
  const events = useSelector((state: RootState) => state.activityFeed.events);
  const visibleEvents = events.slice(0, VISIBLE_EVENT_COUNT);
  const [flashId, setFlashId] = useState<string | null>(null);
  const latestIdRef = useRef<string | null>(null);

  useEffect(() => {
    const latest = events[0];
    if (latest && latest.id !== latestIdRef.current) {
      latestIdRef.current = latest.id;
      setFlashId(latest.id);
      const timeout = window.setTimeout(() => setFlashId(null), 1200);
      return () => window.clearTimeout(timeout);
    }
  }, [events]);

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant flex flex-col h-full min-w-0 overflow-hidden">
      <div className="p-5 border-b border-outline-variant/70 dark:border-dark-outline-variant flex justify-between items-center gap-3 bg-surface-container-low/40 dark:bg-dark-surface-container-low/40">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-bold text-on-surface dark:text-dark-on-surface truncate">Canlı Hareket Akışı</h3>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-success shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            Canlı
          </span>
        </div>
        <Link to="/activities" className="text-xs font-medium text-primary flex items-center gap-1 shrink-0">
          Tümünü Gör <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      <div className="flex-1">
        {visibleEvents.length === 0 ? (
          <div className="min-h-[168px] flex flex-col items-center justify-center gap-2 text-center px-6 py-8">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/25 dark:text-dark-on-surface-variant/25">bolt</span>
            <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant max-w-xs">
              Henüz bir işlem yapılmadı. Kullanıcı Yönetimi'nde bir rol/durum değişikliği deneyin.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant/70 dark:divide-dark-outline-variant">
            {visibleEvents.map((event) => {
              const Icon = EVENT_ICONS[event.type];
              return (
                <li
                  key={event.id}
                  className={`px-5 py-3 flex items-start gap-3 transition-colors duration-700 animate-in fade-in slide-in-from-top-2 ${flashId === event.id ? 'bg-on-surface/5 dark:bg-dark-on-surface/5' : ''
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${EVENT_COLORS[event.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface dark:text-dark-on-surface truncate">
                      <span className="font-semibold">{event.actor}</span>{' '}
                      <span className="text-on-surface-variant dark:text-dark-on-surface-variant">{event.message}</span>
                    </p>
                    <p className="text-[11px] text-on-surface-variant/70 dark:text-dark-on-surface-variant/70 mt-0.5">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
            {visibleEvents.length < MIN_ROW_COUNT &&
              Array.from({ length: MIN_ROW_COUNT - visibleEvents.length }).map((_, index) => (
                <li key={`spacer-${index}`} className="px-5 py-3 h-[52px]" aria-hidden="true" />
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};
