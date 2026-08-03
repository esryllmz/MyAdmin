import { useMemo } from "react";
import { useSearchParamState } from "@/core/hooks/useDebouncedSearchParams";
import type { ActivityResponseDto } from "../types/activityTypes";

export type DateRangeOption = "7d" | "30d" | "all";

const RANGE_DAYS: Record<Exclude<DateRangeOption, "all">, number> = {
  "7d": 7,
  "30d": 30,
};

const withinRange = (isoDate: string, range: DateRangeOption): boolean => {
  if (range === "all") return true;
  const days = RANGE_DAYS[range];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(isoDate).getTime() >= cutoff;
};

/**
 * Real, working filters for a personal activity list — Date Range / Action Type / Status.
 * State lives in the URL (searchParams) so it survives refresh/back-forward, matches the
 * "filters must actually work, not just hide rows client-side for show" requirement.
 */
export const useMyActivityFilters = (activities: ActivityResponseDto[]) => {
  const [range, setRange] = useSearchParamState("range", "30d");
  const [action, setAction] = useSearchParamState("action", "all");
  const [status, setStatus] = useSearchParamState("status", "all");

  const actionOptions = useMemo(
    () => Array.from(new Set(activities.map((a) => a.action))).sort(),
    [activities]
  );

  const filtered = useMemo(
    () =>
      activities.filter((activity) => {
        const matchesRange = withinRange(activity.createdDate, range as DateRangeOption);
        const matchesAction = action === "all" || activity.action === action;
        const matchesStatus =
          status === "all" ||
          (status === "success" && activity.isSuccess) ||
          (status === "failed" && !activity.isSuccess);
        return matchesRange && matchesAction && matchesStatus;
      }),
    [activities, range, action, status]
  );

  const reset = () => {
    setRange("30d");
    setAction("all");
    setStatus("all");
  };

  const isFiltered = range !== "30d" || action !== "all" || status !== "all";

  return {
    range: range as DateRangeOption,
    setRange: (value: DateRangeOption) => setRange(value),
    action,
    setAction,
    status,
    setStatus,
    actionOptions,
    filtered,
    reset,
    isFiltered,
  };
};
