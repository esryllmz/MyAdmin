import PermissionCatalog from '@/features/roles/components/PermissionCatalog';

const PermissionsPage = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight mb-2">
          Permissions
        </h2>
        <p className="text-on-surface-variant dark:text-dark-on-surface-variant text-sm">
          Every permission defined in the system and the roles it is granted to.
        </p>
      </div>

      <PermissionCatalog />
    </div>
  );
};

export default PermissionsPage;
