import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import {
  useUsers,
  useDeleteUser,
  useUpdateUserStatus,
  useSyncUserRole,
  useUserById,
} from '../hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useActivities, useOperationalActivities } from '@/features/activities/hooks/useActivities';
import { useTeamsForUser } from '@/features/teams/hooks/useTeams';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';
import EditUserModal from '../components/EditUserModal';

type AdminTabKey = 'profile' | 'access' | 'sessions' | 'activity' | 'security';

const ADMIN_TABS: Array<{ key: AdminTabKey; label: string }> = [
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

const AdminUserDetail = ({ id }: { id: string }) => {
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
        <p className="mt-3 text-on-surface-variant dark:text-dark-on-surface-variant">User not found.</p>
        <button
          onClick={() => navigate('/team')}
          className="mt-4 text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:underline"
        >
          Back to Users
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
        {ADMIN_TABS.map((tabItem) => (
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
            ['Username', user.username],
            ['Email', user.email],
            ['Bio', user.bio || '—'],
            ['Joined', new Date(user.createdDate).toLocaleDateString('en-US')],
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
            Active Role
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
              {user.roles?.[0]?.name ?? 'No role assigned'}
            </span>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mt-6 mb-2">
            Permission Scope
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.roles?.[0]?.permissions?.length ? (
              user.roles[0].permissions.map((permission) => (
                <span key={permission.id} className="text-[10px] font-medium bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-1 rounded-md">
                  {permission.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">This role has no defined permissions.</p>
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
                title={session.current ? "Current session can't be revoked" : 'Revoke session'}
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
              No recorded activity for this user.
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
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Not configured in this environment.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-1 rounded">
              Not Configured
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/60 dark:border-dark-outline-variant pt-5">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Password</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                Last changed: {new Date(user.updatedDate ?? user.createdDate).toLocaleDateString('en-US')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/60 dark:border-dark-outline-variant pt-5">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Account Status</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                {user.isActive ? 'Active — can sign in.' : 'Inactive — sign-in blocked.'}
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

type EditorTabKey = 'profile' | 'teams' | 'activity' | 'access';

const EDITOR_TABS: Array<{ key: EditorTabKey; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'teams', label: 'Teams' },
  { key: 'activity', label: 'Activity' },
  { key: 'access', label: 'Access Summary' },
];

/** Editor's Viewer detail — backend enforces the target must actually be a Viewer (GetById/UpdateStatus). */
const EditorUserDetail = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useUserById(id);
  const { data: teams = [], isLoading: teamsLoading } = useTeamsForUser(id);
  const { data: operational = [], isLoading: activityLoading } = useOperationalActivities({ entityName: 'User', userId: id });
  const [tab, setTab] = useSearchParamState('tab', 'profile');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const updateStatus = useUpdateUserStatus();

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
        <p className="mt-3 text-on-surface-variant dark:text-dark-on-surface-variant">User not found.</p>
        <button onClick={() => navigate('/team')} className="mt-4 text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:underline">
          Back to Users
        </button>
      </div>
    );
  }

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
            onClick={() => updateStatus.mutate({ id: user.id, isActive: !user.isActive })}
            disabled={updateStatus.isPending}
            className="text-xs font-semibold text-on-surface dark:text-dark-on-surface border border-outline-variant dark:border-dark-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors disabled:opacity-40"
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-outline-variant/60 dark:border-dark-outline-variant mb-6 overflow-x-auto">
        {EDITOR_TABS.map((tabItem) => (
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
            ['Username', user.username],
            ['Email', user.email],
            ['Status', user.isActive ? 'Active' : 'Inactive'],
            ['Created', new Date(user.createdDate).toLocaleDateString('en-US')],
            ['Updated', user.updatedDate ? formatRelativeTime(user.updatedDate) : '—'],
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

      {tab === 'teams' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {teamsLoading ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Loading...</p>
          ) : teams.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              Not a member of any team yet.
            </p>
          ) : (
            teams.map((team) => (
              <button
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface-container-high/40 dark:hover:bg-dark-surface-container-high/40 transition-colors"
              >
                <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{team.name}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${team.isActive ? 'bg-success/10 text-success' : 'bg-surface-dim dark:bg-dark-surface-dim text-on-surface-variant dark:text-dark-on-surface-variant'
                    }`}
                >
                  {team.isActive ? 'Active' : 'Inactive'}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {activityLoading ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Loading...</p>
          ) : operational.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              No recorded activity for this account yet.
            </p>
          ) : (
            operational.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-on-surface dark:text-dark-on-surface">{activity.newValues || activity.action}</span>
                <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                  {formatRelativeTime(activity.createdDate)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'access' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1">
            Application Role
          </p>
          <p className="text-sm text-on-surface dark:text-dark-on-surface mb-6">Viewer</p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1">
            Access Scope
          </p>
          <p className="text-sm text-on-surface dark:text-dark-on-surface">Personal workspace</p>
        </div>
      )}

      <EditUserModal user={user} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
};

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isEditor } = useRolePermissions();

  if (!id) return null;

  return isEditor ? <EditorUserDetail id={id} /> : <AdminUserDetail id={id} />;
};

export default UserDetailPage;
