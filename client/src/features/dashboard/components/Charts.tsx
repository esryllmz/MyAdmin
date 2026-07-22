import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/core/theme/ThemeContext';

// Sample data for user registration trend
const userRegistrationData = [
  { month: 'Jan', users: 240, active: 210 },
  { month: 'Feb', users: 320, active: 250 },
  { month: 'Mar', users: 280, active: 240 },
  { month: 'Apr', users: 450, active: 380 },
  { month: 'May', users: 520, active: 410 },
  { month: 'Jun', users: 680, active: 520 },
  { month: 'Jul', users: 720, active: 600 },
];

// Sample data for activity distribution
const activityData = [
  { name: 'Login', value: 2400 },
  { name: 'Edit', value: 1398 },
  { name: 'Delete', value: 980 },
  { name: 'Create', value: 1908 },
  { name: 'Export', value: 781 },
];

export const UserRegistrationChart = () => {
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
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={userRegistrationData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
          <XAxis stroke={colors.textColor} />
          <YAxis stroke={colors.textColor} />
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
    </div>
  );
};

export const ActivityDistributionChart = () => {
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
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={activityData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
          <XAxis stroke={colors.textColor} />
          <YAxis stroke={colors.textColor} />
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
    </div>
  );
};
