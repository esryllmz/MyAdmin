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
    <div className={`${isBright ? 'bg-surface-bright dark:bg-dark-surface-bright' : 'bg-surface-container-lowest dark:bg-dark-surface-container-lowest'} rounded-xl p-6 border border-outline-variant/60 dark:border-dark-outline-variant hover:border-outline dark:hover:border-dark-outline transition-colors flex flex-col justify-between h-40 relative overflow-hidden`}>
      <div className="flex justify-between items-start relative z-10">
        <span className="text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant">{title}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[color]}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>
      <div className="relative z-10">
        {isLoading ? (
          <Skeleton className="h-8 w-24 rounded-md mb-1" />
        ) : (
          <div className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface">{value}</div>
        )}
        {trend && !isLoading && (
          <div className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
            <span className="text-success">↑ {trend}</span> vs last month
          </div>
        )}
        {subText && !isLoading && (
          <div className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-1">{subText}</div>
        )}
        {badge && !isLoading && (
          <span className="bg-on-surface-variant/10 text-on-surface-variant dark:bg-dark-on-surface-variant/10 dark:text-dark-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-bold">
            {badge}
          </span>
        )}
        {isLoading && (trend || subText || badge) && <Skeleton className="h-3 w-20 rounded mt-2" />}
      </div>
    </div>
  );
};
