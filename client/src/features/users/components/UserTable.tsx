import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { useDeleteUser, useSyncUserRole, useUpdateUserStatus, useUsers } from '../hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { Skeleton } from '@/core/components/ui/skeleton';
import type { ApiResponse } from '@/core/types/ApiResponse';
import type { RootState } from '@/core/store/store';
import type { UserResponseDto } from '../types/userTypes';
import { useDebouncedSearchParam, useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { useIsAdmin } from '@/core/hooks/useIsAdmin';

const PAGE_SIZE = 8;
const DELETE_CONFIRM_TIMEOUT = 3000;

const UserTable = () => {
  const { data: users, isLoading, isError, error } = useUsers();
  const { data: roles } = useRoles();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = useIsAdmin();

  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();
  const syncRole = useSyncUserRole();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useDebouncedSearchParam('q', { resetKeys: ['page'] });
  const [pageParam, setPageParam] = useSearchParamState('page', '1');
  const page = Math.max(1, Number(pageParam) || 1);

  const guardAdminAction = () => {
    if (!isAdmin) {
      toast.error('Bu işlem için yetkiniz bulunmamaktadır.');
      return false;
    }
    return true;
  };

  const handleToggleStatus = (user: UserResponseDto) => {
    if (!guardAdminAction()) return;
    updateStatus.mutate({ id: user.id, isActive: !user.isActive });
  };

  const handleRoleChange = (user: UserResponseDto, roleName: string) => {
    if (!guardAdminAction()) return;
    const targetRole = roles?.find((role) => role.name === roleName);
    if (!targetRole) return;
    syncRole.mutate({ userId: user.id, role: targetRole });
  };

  const handleDeleteClick = (user: UserResponseDto) => {
    const isSelf = currentUser?.id === user.id;
    if (!isSelf && !guardAdminAction()) return;

    if (confirmDeleteId !== user.id) {
      setConfirmDeleteId(user.id);
      window.setTimeout(() => {
        setConfirmDeleteId((current) => (current === user.id ? null : current));
      }, DELETE_CONFIRM_TIMEOUT);
      return;
    }

    setConfirmDeleteId(null);
    deleteUser.mutate(user.id);
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 1. Yüklenme Durumu (Loading State)
  // Gerçek tablonun yapısını (toolbar + başlık + satır + sayfalama) birebir yansıtan
  // bir skeleton kullanılıyor; böylece veri gelince yükseklik/düzen kaymıyor (layout shift yok).
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="p-5 border-b border-outline-variant/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-low/30">
          <Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low/50 text-on-surface-variant font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4 border-b border-outline-variant/10">Kullanıcı Bilgileri</th>
                <th className="px-6 py-4 border-b border-outline-variant/10">Hesap Durumu</th>
                <th className="px-6 py-4 border-b border-outline-variant/10">Yetki Grupları</th>
                <th className="px-6 py-4 border-b border-outline-variant/10 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-3.5 w-28 rounded" />
                        <Skeleton className="h-3 w-36 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Skeleton className="h-8 w-24 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
      </div>
    );
  }

  // 2. Hata Durumu (Error State)
  // TypeScript 'Error' tipini 'ApiResponse' tipine doğrudan cast edemediği için
  // araya 'unknown' köprüsü kurarak tip güvenliğini sağlıyoruz.
  if (isError) {
    const apiError = (error as unknown) as ApiResponse<null>;

    return (
      <div className="bg-error/5 border border-error/20 rounded-xl p-10 text-center max-w-2xl mx-auto my-4">
        <span className="material-symbols-outlined text-error text-5xl mb-4">report_problem</span>
        <h3 className="text-on-surface font-bold text-xl mb-2">Sistem Hatası</h3>
        <p className="text-on-surface-variant text-sm mb-6">
          {apiError?.message || "Sunucuyla bağlantı kurulurken teknik bir sorun oluştu."}
        </p>

        {apiError?.errors && apiError.errors.length > 0 && (
          <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 text-left border border-error/10">
            <p className="text-[10px] font-black text-error/60 mb-2 uppercase tracking-widest">Hata Detayları</p>
            <ul className="space-y-1.5">
              {apiError.errors.map((err, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-error/90 font-medium">
                  <span className="w-1 h-1 rounded-full bg-error mt-1.5 flex-shrink-0" />
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden transition-all">
      {/* Tablo Üst Araç Çubuğu */}
      <div className="p-5 border-b border-outline-variant/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-low/30">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
            filter_alt
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kullanıcı ara veya filtrele..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-semibold text-on-background">{filteredUsers.length}</span> kullanıcı
          {search && <span className="text-on-surface-variant/60">/ {users?.length || 0} toplam</span>}
        </div>
      </div>

      {/* Veri Tablosu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface-container-low/50 text-on-surface-variant font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4 border-b border-outline-variant/10">Kullanıcı Bilgileri</th>
              <th className="px-6 py-4 border-b border-outline-variant/10">Hesap Durumu</th>
              <th className="px-6 py-4 border-b border-outline-variant/10">Yetki Grupları</th>
              <th className="px-6 py-4 border-b border-outline-variant/10 text-right">Eylemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-high shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shadow-sm">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-on-background group-hover:text-primary transition-colors italic">@{user.username}</span>
                      <span className="text-[11px] text-on-surface-variant/80">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                      disabled={updateStatus.isPending && updateStatus.variables?.id === user.id}
                      className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isAdmin ? 'Durumu değiştir' : 'Bu işlem için yetkiniz bulunmamaktadır'}
                    >
                      {updateStatus.isPending && updateStatus.variables?.id === user.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-on-surface-variant" />
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-success' : 'bg-outline'}`}></span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight transition-colors ${user.isActive
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-surface-dim text-on-surface-variant hover:bg-surface-container-high'
                        }`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin && roles && roles.length > 0 ? (
                      <select
                        value={user.roles?.[0]?.name ?? ''}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        disabled={syncRole.isPending && syncRole.variables?.userId === user.id}
                        className="bg-surface border border-outline-variant/20 rounded-md text-[11px] font-bold uppercase tracking-wider px-2 py-1 outline-none focus:border-primary transition-all disabled:opacity-50"
                      >
                        {!user.roles?.[0] && <option value="">Rol Tanımsız</option>}
                        {roles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <span
                              key={role.id}
                              className="text-[9px] font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2 py-1 rounded-md border border-outline-variant/10"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-on-surface-variant/40 italic">Rol Tanımsız</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary/5 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        Yönet
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(user)}
                        disabled={deleteUser.isPending && deleteUser.variables === user.id}
                        title="Kullanıcıyı sil"
                        className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50 ${confirmDeleteId === user.id
                            ? 'bg-error text-white hover:brightness-110'
                            : 'text-error hover:bg-error/10'
                          }`}
                      >
                        {deleteUser.isPending && deleteUser.variables === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        {confirmDeleteId === user.id ? 'Emin misiniz?' : ''}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">person_off</span>
                    <p className="text-on-surface-variant font-medium">
                      {search ? `"${search}" ile eşleşen kullanıcı bulunamadı.` : 'Sistemde kayıtlı kullanıcı bulunamadı.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {filteredUsers.length > 0 && (
        <div className="px-5 py-3 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
          <span className="text-xs text-on-surface-variant">
            Sayfa <span className="font-semibold text-on-background">{currentPage}</span> / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageParam(String(currentPage - 1))}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Önceki
            </button>
            <button
              type="button"
              onClick={() => setPageParam(String(currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Sonraki
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;