interface HealthIndicator {
  label: string;
  status: 'operational' | 'degraded' | 'down';
  detail: string;
}

const INDICATORS: HealthIndicator[] = [
  { label: 'API', status: 'operational', detail: '99.98% uptime' },
  { label: 'Database', status: 'operational', detail: 'EF Core · SQL Server' },
  { label: 'Auth / JWT', status: 'operational', detail: 'Refresh cycle healthy' },
  { label: 'Realtime Bus', status: 'operational', detail: 'Event delivery normal' },
];

const STATUS_STYLES: Record<HealthIndicator['status'], string> = {
  operational: 'bg-success',
  degraded: 'bg-warning',
  down: 'bg-error',
};

const STATUS_LABEL: Record<HealthIndicator['status'], string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
};

export const SystemHealthPanel = () => {
  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6 flex flex-col h-full">
      <h3 className="font-bold text-on-surface dark:text-dark-on-surface text-sm mb-1">System Health</h3>
      <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mb-5">
        Core service status at a glance.
      </p>

      <div className="flex flex-col gap-4 flex-1">
        {INDICATORS.map((indicator) => (
          <div key={indicator.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[indicator.status]}`} />
              <div>
                <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{indicator.label}</p>
                <p className="text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant">{indicator.detail}</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant dark:text-dark-on-surface-variant">
              {STATUS_LABEL[indicator.status]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-5 border-t border-outline-variant/60 dark:border-dark-outline-variant">
        <p className="text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant">
          All systems nominal. Last checked just now.
        </p>
      </div>
    </div>
  );
};
