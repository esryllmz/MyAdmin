import { useState } from 'react';
import { toast } from 'react-toastify';

const SecuritySettingsTab = () => {
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <div>
          <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Multi-Factor Authentication</p>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">Bu ortamda henüz yapılandırılmadı.</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-1 rounded">
          Not Configured
        </span>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Recovery Codes</p>
        <button
          type="button"
          onClick={() => toast.info('Kurtarma kodları MFA etkinleştirildiğinde üretilir.')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors"
        >
          Generate Recovery Codes
        </button>
      </div>

      <label className="flex items-center justify-between gap-4 border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5 cursor-pointer">
        <div>
          <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Login Alerts</p>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">Yeni bir cihazdan giriş yapıldığında bildir.</p>
        </div>
        <input
          type="checkbox"
          checked={loginAlerts}
          onChange={() => setLoginAlerts((prev) => !prev)}
          className="rounded border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface focus:ring-0 w-5 h-5"
        />
      </label>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Trusted Devices</p>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
          Güvenilir cihazlarınızı Security &gt; Sessions altında görüntüleyin.
        </p>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Session Timeout</p>
        <select
          value={sessionTimeout}
          onChange={(e) => setSessionTimeout(e.target.value)}
          className="bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
        >
          <option value="15">15 dakika</option>
          <option value="30">30 dakika</option>
          <option value="60">1 saat</option>
          <option value="480">8 saat</option>
        </select>
      </div>

      <div>
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Password Policy</p>
        <ul className="space-y-1.5 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
          <li>En az 8 karakter</li>
          <li>En az 1 büyük harf ve 1 rakam</li>
          <li>90 günde bir yenileme önerisi</li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettingsTab;
