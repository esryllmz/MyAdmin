import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { useUsers, useDeleteUser, useUpdateUserStatus, useSyncUserRole } from '../hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

type TabKey = 'profile' | 'access' | 'sessions' | 'activity' | 'security';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'access', label: 'Access' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'activity', label: 'Activity' },
  { key: 'security', label: 'Security' },
];

const MOCK_SESSIONS = [
  { id: 'sess-01', device: 'Chrome · Windows 11', location: 'Istanbul, TR', lastActive: new Date(Date.now() - 4 * 60 * 1000).toISOString(), current: true },
  { id: 'sess-02', device: 'Safari · iPhone 15', location: 'Istanbul, TR', lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), current: false },
];

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const { data: activities = [] } = useActivities();
  const { can } = useRolePermissions();
  const [tab, setTab] = useSearchParamState('tab', 'profile');

  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();
  const syncRole = useSyncUserRole();

  const user = useMemo(() => users.find((candidate) => candidate.id === id), [users, id]);
  const userActivities = useMemo(
    () => activities.filter((activity) => activity.userId === id).slice(0, 20),
    [activities, id]
  );

  const toggleStatusPermission = can('toggleUserStatus');
  const syncRolePermission = can('syncUserRole');
  const deleteUserPermission = can('deleteUser');

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-on-surface-variant dark:text-dark-on-surface-variant" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full text-center py-24">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 dark:text-dark-on-surface-variant/30">person_off</span>
        <p className="mt-3 text-on-surface-variant dark:text-dark-on-surface-variant">Kullanıcı bulunamadı.</p>
        <button
          onClick={() => navigate('/team')}
          className="mt-4 text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:underline"
        >
          Kullanıcı listesine dön
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (!deleteUserPermission.allowed) {
      toast.error(deleteUserPermission.reason);
      return;
    }
    deleteUser.mutate(user.id, { onSuccess: () => navigate('/team') });
  };

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-5xl mx-auto w-full">
      <button
        onClick={() => navigate('/team')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Users
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-on-surface/10 dark:bg-dark-on-surface/10 text-on-surface dark:text-dark-on-surface flex items-center justify-center font-bold text-lg border border-outline-variant dark:border-dark-outline-variant overflow-hidden">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user.username.substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">@{user.username}</h2>
            <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${user.isActive ? 'bg-success/10 text-success' : 'bg-surface-dim dark:bg-dark-surface-dim text-on-surface-variant dark:text-dark-on-surface-variant'
              }`}
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!deleteUserPermission.allowed || deleteUser.isPending}
            title={deleteUserPermission.allowed ? undefined : deleteUserPermission.reason}
            className="inline-flex items-center gap-1.5 text-error hover:bg-error/10 font-semibold text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete User
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-outline-variant/60 dark:border-dark-outline-variant mb-6 overflow-x-auto">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-3.5 pb-3 border-b-2 text-sm whitespace-nowrap transition-colors ${tab === tabItem.key
                ? 'border-on-surface dark:border-dark-on-surface text-on-surface dark:text-dark-on-surface font-semibold'
                : 'border-transparent text-on-surface-variant dark:text-dark-on-surface-variant font-medium hover:text-on-surface dark:hover:text-dark-on-surface'
              }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            ['Kullanıcı Adı', user.username],
            ['E-posta', user.email],
            ['Biyografi', user.bio || '—'],
            ['Katılım Tarihi', new Date(user.createdDate).toLocaleDateString('tr-TR')],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
                {label}
              </p>
              <p className="text-sm text-on-surface dark:text-dark-on-surface mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'access' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-2">
            Aktif Rol
          </p>
          {syncRolePermission.allowed ? (
            <select
              value={user.roles?.[0]?.name ?? ''}
              onChange={(e) => {
                const targetRole = roles.find((role) => role.name === e.target.value);
                if (targetRole) syncRole.mutate({ userId: user.id, role: targetRole });
              }}
              disabled={syncRole.isPending}
              className="bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface rounded-lg text-sm px-3 py-2 outline-none focus:border-outline dark:focus:border-dark-outline disabled:opacity-50"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="inline-flex text-xs font-bold uppercase tracking-widest bg-secondary-container dark:bg-dark-secondary-container text-on-secondary-container dark:text-dark-on-secondary-container px-2.5 py-1 rounded-md">
              {user.roles?.[0]?.name ?? 'Rol Tanımsız'}
            </span>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mt-6 mb-2">
            Yetki Kapsamı
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.roles?.[0]?.permissions?.length ? (
              user.roles[0].permissions.map((permission) => (
                <span key={permission.id} className="text-[10px] font-medium bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-1 rounded-md">
                  {permission.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Bu role ait tanımlı yetki yok.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {MOCK_SESSIONS.map((session) => (
            <div key={session.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface flex items-center gap-2">
                  {session.device}
                  {session.current && (
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-success/10 text-success px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
                  {session.location} · {formatRelativeTime(session.lastActive)}
                </p>
              </div>
              <button
                type="button"
                disabled={session.current || !toggleStatusPermission.allowed}
                title={session.current ? 'Mevcut oturum sonlandırılamaz' : 'Oturumu sonlandır'}
                className="text-xs font-semibold text-error hover:bg-error/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'activity' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {userActivities.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              Bu kullanıcı için aktivite kaydı yok.
            </p>
          ) : (
            userActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-on-surface dark:text-dark-on-surface">
                  {activity.action} · {activity.entityName}
                </span>
                <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                  {formatRelativeTime(activity.createdDate)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Multi-Factor Authentication</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Bu ortamda henüz yapılandırılmadı.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-1 rounded">
              Not Configured
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/60 dark:border-dark-outline-variant pt-5">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Password</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                Son değişiklik: {new Date(user.updatedDate ?? user.createdDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/60 dark:border-dark-outline-variant pt-5">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Hesap Durumu</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                {user.isActive ? 'Aktif — sisteme giriş yapabilir.' : 'Pasif — giriş engellendi.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateStatus.mutate({ id: user.id, isActive: !user.isActive })}
              disabled={!toggleStatusPermission.allowed || updateStatus.isPending}
              title={toggleStatusPermission.allowed ? undefined : toggleStatusPermission.reason}
              className="text-xs font-semibold text-on-surface dark:text-dark-on-surface border border-outline-variant dark:border-dark-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailPage;
