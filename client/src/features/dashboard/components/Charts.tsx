import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/core/theme/ThemeContext';
import { Skeleton } from '@/core/components/ui/skeleton';
import type { DistributionPoint, RegistrationPoint } from '../hooks/useDashboardStats';

interface UserRegistrationChartProps {
  data: RegistrationPoint[];
  isLoading?: boolean;
}

interface ActivityDistributionChartProps {
  data: DistributionPoint[];
  isLoading?: boolean;
}

export const UserRegistrationChart = ({ data, isLoading }: UserRegistrationChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    textColor: isDark ? '#e6edf3' : '#0b1c30',
    gridColor: isDark ? '#30363d' : '#c3c6d7',
    lineColor: isDark ? '#5a9eff' : '#004ac6',
    fillColor: isDark ? 'rgba(90, 158, 255, 0.1)' : 'rgba(0, 74, 198, 0.1)',
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/10 dark:border-dark-outline-variant/10 p-6">
      <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-4">
        User Registration Trend
      </h3>
      {isLoading ? (
        <Skeleton className="h-[300px] w-full rounded-lg" />
      ) : data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Henüz kayıt verisi yok.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
            <XAxis dataKey="label" stroke={colors.textColor} />
            <YAxis stroke={colors.textColor} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#161b22' : '#ffffff',
                border: `1px solid ${colors.gridColor}`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: colors.textColor }}
            />
            <Legend wrapperStyle={{ color: colors.textColor }} />
            <Area
              type="monotone"
              dataKey="users"
              stroke={colors.lineColor}
              fill={colors.fillColor}
              name="Total Registrations"
            />
            <Area
              type="monotone"
              dataKey="active"
              stroke={isDark ? '#22c55e' : '#10b981'}
              fill={isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)'}
              name="Active Users"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const ActivityDistributionChart = ({ data, isLoading }: ActivityDistributionChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    textColor: isDark ? '#e6edf3' : '#0b1c30',
    gridColor: isDark ? '#30363d' : '#c3c6d7',
  };

  const chartColors = ['#004ac6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/10 dark:border-dark-outline-variant/10 p-6">
      <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-4">
        Activity Distribution
      </h3>
      {isLoading ? (
        <Skeleton className="h-[300px] w-full rounded-lg" />
      ) : data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Henüz aktivite verisi yok.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
            <XAxis dataKey="name" stroke={colors.textColor} />
            <YAxis stroke={colors.textColor} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#161b22' : '#ffffff',
                border: `1px solid ${colors.gridColor}`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: colors.textColor }}
            />
            <Legend wrapperStyle={{ color: colors.textColor }} />
            <Bar dataKey="value" fill={chartColors[0]} name="Activity Count" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
