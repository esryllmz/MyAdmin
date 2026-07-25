const INTEGRATIONS = [
  { name: 'Webhooks', description: 'Push mutation events to an external endpoint.', status: 'not-configured' },
  { name: 'Email Provider', description: 'Outbound transactional email delivery.', status: 'not-configured' },
  { name: 'Logging Destination', description: 'Ship audit logs to an external sink.', status: 'coming-later' },
  { name: 'Analytics', description: 'Usage analytics for admin operations.', status: 'coming-later' },
  { name: 'External Identity Provider', description: 'SSO via SAML or OpenID Connect.', status: 'not-configured' },
];

const STATUS_LABEL: Record<string, string> = {
  'not-configured': 'Not Configured',
  'coming-later': 'Coming Later',
};

const IntegrationsTab = () => {
  return (
    <div className="max-w-xl space-y-3">
      {INTEGRATIONS.map((integration) => (
        <div
          key={integration.name}
          className="flex items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant"
        >
          <div>
            <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{integration.name}</p>
            <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">{integration.description}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-1 rounded shrink-0">
            {STATUS_LABEL[integration.status]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default IntegrationsTab;
