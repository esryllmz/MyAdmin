interface ActivityFilterProps {
  entity: string;
  status: string;
  entityOptions: string[];
  onEntityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const ActivityFilter = ({ entity, status, entityOptions, onEntityChange, onStatusChange }: ActivityFilterProps) => (
  <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl p-4 flex flex-wrap gap-4 items-center border border-outline-variant/60 dark:border-dark-outline-variant">
    <div className="flex-1 min-w-[200px]">
      <label className="text-xs font-semibold text-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider mb-1 block">Entity</label>
      <select
        value={entity}
        onChange={(e) => onEntityChange(e.target.value)}
        className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg py-2 px-3 text-sm focus:border-outline dark:focus:border-dark-outline text-on-surface dark:text-dark-on-surface appearance-none outline-none"
      >
        <option value="all">All Entities</option>
        {entityOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
    <div className="flex-1 min-w-[220px]">
      <label className="text-xs font-semibold text-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider mb-1 block">Status</label>
      <div className="flex gap-2 h-[38px]">
        <button
          type="button"
          onClick={() => onStatusChange('all')}
          className={`flex-1 rounded-lg text-sm font-medium transition-colors ${status === 'all'
              ? 'bg-on-surface text-surface dark:bg-dark-on-surface dark:text-dark-surface'
              : 'bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
            }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('success')}
          className={`flex-1 rounded-lg text-sm font-medium transition-all ${status === 'success'
              ? 'bg-success text-white'
              : 'bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
            }`}
        >
          Success
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('failed')}
          className={`flex-1 rounded-lg text-sm font-medium transition-colors ${status === 'failed'
              ? 'bg-error text-white'
              : 'bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
            }`}
        >
          Failed
        </button>
      </div>
    </div>
  </div>
);
