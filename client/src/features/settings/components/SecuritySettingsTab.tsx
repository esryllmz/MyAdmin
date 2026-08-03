import { Link } from 'react-router-dom';

const SecuritySettingsTab = () => {
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <div>
          <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Multi-Factor Authentication</p>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">Coming later.</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-1 rounded">
          Not Available
        </span>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-1">Password</p>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mb-3">
          Change your password from Account settings.
        </p>
        <Link
          to="/settings/account"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors"
        >
          Go to Account
        </Link>
      </div>

      <div>
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Password Policy</p>
        <ul className="space-y-1.5 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
          <li>At least 8 characters</li>
          <li>At least one uppercase and one lowercase letter</li>
          <li>At least one number</li>
          <li>At least one special character (!, ?, *, .)</li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettingsTab;
