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
  primary: 'bg-primary-fixed/20 text-primary',
  secondary: 'bg-secondary-fixed/20 text-secondary',
  error: 'bg-error-fixed/20 text-error',
};

export const StatCard = ({ title, value, trend, subText, badge, icon, color = 'primary', isBright, isLoading }: StatCardProps) => {
  return (
    <div className={`${isBright ? 'bg-surface-bright' : 'bg-surface-container-lowest'} rounded-xl p-6 border border-outline-variant/20 hover:border-outline-variant/40 transition-colors flex flex-col justify-between h-40 relative overflow-hidden`}>
      <div className="flex justify-between items-start relative z-10">
        <span className="text-sm font-medium text-on-surface-variant">{title}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[color]}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>
      <div className="relative z-10">
        {isLoading ? (
          <Skeleton className="h-8 w-24 rounded-md mb-1" />
        ) : (
          <div className={`text-3xl font-bold tracking-tight ${isBright ? 'text-primary' : 'text-on-surface'}`}>{value}</div>
        )}
        {trend && !isLoading && <div className="text-xs text-on-surface-variant mt-1"><span className="text-emerald-600">↑ {trend}</span> vs last month</div>}
        {subText && !isLoading && <div className="text-xs text-on-surface-variant mt-1">{subText}</div>}
        {badge && !isLoading && <span className="bg-error-container text-on-error-container px-1.5 py-0.5 rounded text-[10px] font-bold">{badge}</span>}
        {isLoading && (trend || subText || badge) && <Skeleton className="h-3 w-20 rounded mt-2" />}
      </div>
    </div>
  );
};