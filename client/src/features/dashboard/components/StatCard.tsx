import { Skeleton } from '@/core/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  subText?: string;
  badge?: string;
  icon: string;
  color?: 'primary' | 'secondary' | 'error';
  isBright?: boolean;
  isLoading?: boolean;
}

const colorMap = {
  primary: 'bg-on-surface/10 text-on-surface dark:bg-dark-on-surface/10 dark:text-dark-on-surface',
  secondary: 'bg-on-surface-variant/10 text-on-surface-variant dark:bg-dark-on-surface-variant/10 dark:text-dark-on-surface-variant',
  error: 'bg-error/10 text-error',
};

export const StatCard = ({ title, value, trend, subText, badge, icon, color = 'primary', isBright, isLoading }: StatCardProps) => {
  return (
    <div
      className={`${isBright
          ? 'bg-surface-container-high dark:bg-dark-surface-container-high border-on-surface/25 dark:border-dark-on-surface/25'
          : 'bg-surface-container-lowest dark:bg-dark-surface-container-lowest border-outline-variant/70 dark:border-dark-outline-variant'
        } rounded-xl p-6 border hover:border-outline dark:hover:border-dark-outline transition-colors flex flex-col justify-between min-h-40 relative overflow-hidden min-w-0`}
    >
      <div className="flex justify-between items-start gap-3 relative z-10 min-w-0">
        <span className="text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant truncate" title={title}>
          {title}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>
      <div className="relative z-10 min-w-0">
        {isLoading ? (
          <Skeleton className="h-8 w-24 rounded-md mb-1" />
        ) : (
          <div className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface truncate" title={value}>
            {value}
          </div>
        )}
        {trend && !isLoading && (
          <div className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
            <span className="text-success">↑ {trend}</span> vs last month
          </div>
        )}
        {subText && !isLoading && (
          <div className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-1 truncate">{subText}</div>
        )}
        {badge && !isLoading && (
          <span className="inline-block bg-on-surface-variant/10 text-on-surface-variant dark:bg-dark-on-surface-variant/10 dark:text-dark-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 max-w-full truncate align-top">
            {badge}
          </span>
        )}
        {isLoading && (trend || subText || badge) && <Skeleton className="h-3 w-20 rounded mt-2" />}
      </div>
    </div>
  );
};
