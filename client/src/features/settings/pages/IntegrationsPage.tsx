import IntegrationsTab from '../components/IntegrationsTab';

const IntegrationsPage = () => {
  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight mb-2">Integrations</h2>
        <p className="text-on-surface-variant dark:text-dark-on-surface-variant text-sm">
          External systems this platform can connect to.
        </p>
      </div>
      <IntegrationsTab />
    </div>
  );
};

export default IntegrationsPage;
