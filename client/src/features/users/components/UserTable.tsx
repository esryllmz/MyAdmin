import { useUsers } from '../hooks/useUsers';
import type { ApiResponse } from '@/core/types/ApiResponse';

const UserTable = () => {
  const { data: users, isLoading, isError, error } = useUsers();

  // 1. Yüklenme Durumu (Loading State)
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-16 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <div className="flex flex-col items-center">
          <p className="text-on-surface font-medium">Kullanıcılar Getiriliyor</p>
          <p className="text-on-surface-variant text-xs">Lütfen bekleyiniz...</p>
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
            placeholder="Kullanıcı ara veya filtrele..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-semibold text-on-background">{users?.length || 0}</span> kullanıcı aktif
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
            {users && users.length > 0 ? (
              users.map((user) => (
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
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-success' : 'bg-outline'}`}></span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${user.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-surface-dim text-on-surface-variant'
                        }`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary/5 transition-all active:scale-95">
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      Yönet
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">person_off</span>
                    <p className="text-on-surface-variant font-medium">Sistemde kayıtlı kullanıcı bulunamadı.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;