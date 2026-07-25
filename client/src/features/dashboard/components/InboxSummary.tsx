import { useDispatch } from 'react-redux';
import { openNotificationCenter } from '@/core/store/uiSlice';

export const InboxSummary = () => {
  const dispatch = useDispatch();

  const items = [
    { label: 'System Alerts', desc: 'Unread messages', count: 12, icon: 'mail', color: 'primary' },
    { label: 'Approvals', desc: 'Pending action', count: 5, icon: 'assignment_late', color: 'secondary' },
    { label: 'Direct Mentions', desc: 'In comments', count: 25, icon: 'chat', color: 'tertiary' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-6 flex flex-col h-[400px]">
      <h3 className="font-headline font-bold text-on-surface text-sm mb-6">Inbox Summary</h3>
      <div className="flex flex-col gap-6 flex-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-${item.color}-fixed/20 flex items-center justify-center text-${item.color}`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-on-surface">{item.label}</div>
                <div className="text-xs text-on-surface-variant">{item.desc}</div>
              </div>
            </div>
            <div className="text-lg font-bold text-on-surface">{item.count}</div>
          </div>
        ))}
      </div>
      <button
        onClick={() => dispatch(openNotificationCenter())}
        className="w-full py-2 bg-surface-container-low text-primary text-sm font-medium rounded-lg hover:bg-surface-container-highest transition-colors mt-auto"
      >
        Open Notification Center
      </button>
    </div>
  );
};
