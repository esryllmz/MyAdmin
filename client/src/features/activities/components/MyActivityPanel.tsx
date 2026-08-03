import { useState } from "react";
import { toast } from "react-toastify";
import { RotateCcw, Download } from "lucide-react";
import { useMyActivities } from "../hooks/useActivities";
import { useMyActivityFilters, type DateRangeOption } from "../hooks/useMyActivityFilters";
import { formatRelativeTime } from "@/core/utils/formatRelativeTime";
import { exportToCsv } from "@/core/utils/exportUtils";
import { Skeleton } from "@/core/components/ui/skeleton";

const RANGE_OPTIONS: Array<{ value: DateRangeOption; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

/**
 * The single personal-activity view — reused by /activities (Viewer/Editor branch) and the
 * Reports "My Activity" tab. Always backed by GET /activities/me, which the server scopes to
 * the caller's own user ID — there is no client-side "hide other users' rows" filtering here
 * because the server never returns anyone else's rows to begin with.
 */
export const MyActivityPanel = () => {
  const { data: activities = [], isLoading, isError } = useMyActivities();
  const [isExporting, setIsExporting] = useState(false);
  const { range, setRange, action, setAction, status, setStatus, actionOptions, filtered, reset, isFiltered } =
    useMyActivityFilters(activities);

  const selectClass =
    "bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none";

  const handleExport = () => {
    if (!filtered.length) {
      toast.warning("There's no activity to export.");
      return;
    }
    setIsExporting(true);
    try {
      exportToCsv(
        filtered.map((activity) => ({
          Action: activity.action,
          Status: activity.isSuccess ? "Success" : "Failed",
          Date: activity.createdDate,
        })),
        "my-activity"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant dark:text-dark-on-surface-variant">
            Date Range
          </label>
          <select value={range} onChange={(e) => setRange(e.target.value as DateRangeOption)} className={selectClass}>
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant dark:text-dark-on-surface-variant">
            Action Type
          </label>
          <select value={action} onChange={(e) => setAction(e.target.value)} className={selectClass}>
            <option value="all">All actions</option>
            {actionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant dark:text-dark-on-surface-variant">
            Status
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex-1" />

        {isFiltered && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/60 px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface dark:border-dark-outline-variant dark:text-dark-on-surface-variant dark:hover:bg-dark-surface-container-high dark:hover:text-dark-on-surface"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset Filters
          </button>
        )}

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || !filtered.length}
          className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest dark:text-dark-on-surface dark:hover:bg-dark-surface-container-high"
        >
          <Download size={14} aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <p className="px-5 py-16 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            Something went wrong loading your activity. Please try again.
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            {activities.length === 0 ? "No activity yet." : "No activity matches these filters."}
          </p>
        ) : (
          <div className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
            {filtered.map((activity) => (
              <div key={activity.id} className="density-row flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                <span className="font-medium text-on-surface dark:text-dark-on-surface">{activity.action}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-bold uppercase ${
                      activity.isSuccess ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    }`}
                  >
                    {activity.isSuccess ? "Success" : "Failed"}
                  </span>
                  <span className="text-on-surface-variant dark:text-dark-on-surface-variant">
                    {formatRelativeTime(activity.createdDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
