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
    textColor: isDark ? '#a3a3a3' : '#666666',
    gridColor: isDark ? '#2a2a2a' : '#dddddd',
    lineColor: isDark ? '#f5f5f5' : '#111111',
    fillColor: isDark ? 'rgba(245, 245, 245, 0.08)' : 'rgba(17, 17, 17, 0.06)',
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
                backgroundColor: isDark ? '#1b1b1b' : '#ffffff',
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
              stroke={isDark ? '#a3a3a3' : '#525252'}
              fill={isDark ? 'rgba(163, 163, 163, 0.12)' : 'rgba(82, 82, 82, 0.08)'}
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
    textColor: isDark ? '#a3a3a3' : '#666666',
    gridColor: isDark ? '#2a2a2a' : '#dddddd',
  };

  const chartColors = isDark
    ? ['#f5f5f5', '#d4d4d4', '#a3a3a3', '#737373', '#525252']
    : ['#111111', '#333333', '#525252', '#737373', '#a3a3a3'];

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
                backgroundColor: isDark ? '#1b1b1b' : '#ffffff',
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
