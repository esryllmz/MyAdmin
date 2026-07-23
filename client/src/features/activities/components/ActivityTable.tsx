import { Skeleton } from '@/core/components/ui/skeleton';
import type { ActivityResponseDto } from '../types/activityTypes';

interface ActivityTableProps {
  activities: ActivityResponseDto[];
  selectedId: string | null;
  onSelectRow: (id: string) => void;
  isLoading: boolean;
}

export const ActivityTable = ({ activities, selectedId, onSelectRow, isLoading }: ActivityTableProps) => (
  <div className="flex-1 border-r border-outline-variant/10 overflow-x-auto">
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider border-b border-outline-variant/10">
        <tr>
          <th className="px-6 py-4">Timestamp</th>
          <th className="px-6 py-4">Actor</th>
          <th className="px-6 py-4">Action</th>
          <th className="px-6 py-4">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <tr key={index}>
              <td className="px-6 py-3"><Skeleton className="h-3.5 w-32 rounded" /></td>
              <td className="px-6 py-3"><Skeleton className="h-3.5 w-24 rounded" /></td>
              <td className="px-6 py-3"><Skeleton className="h-5 w-28 rounded-full" /></td>
              <td className="px-6 py-3"><Skeleton className="h-4 w-4 rounded-full" /></td>
            </tr>
          ))
        ) : activities.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-6 py-16 text-center text-on-surface-variant text-sm">
              Bu filtrelerle eşleşen kayıt bulunamadı.
            </td>
          </tr>
        ) : (
          activities.map((activity) => (
            <tr
              key={activity.id}
              onClick={() => onSelectRow(activity.id)}
              className={`hover:bg-surface-container-highest transition-colors cursor-pointer ${selectedId === activity.id ? 'bg-surface-container-high/60' : ''
                }`}
            >
              <td className="px-6 py-4 text-on-surface-variant">
                {new Date(activity.createdDate).toLocaleString('tr-TR')}
              </td>
              <td className="px-6 py-4 font-medium text-on-surface">{activity.userName ?? 'Sistem'}</td>
              <td className="px-6 py-4">
                <span className="bg-primary-container/20 text-primary px-2 py-1 rounded-md text-xs font-semibold">
                  {activity.action} · {activity.entityName}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`material-symbols-outlined ${activity.isSuccess ? 'text-success' : 'text-error'}`}>
                  {activity.isSuccess ? 'check_circle' : 'cancel'}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
