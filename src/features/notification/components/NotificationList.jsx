import { BellOff } from 'lucide-react';
import NotificationItem from './NotificationItem';

export default function NotificationList({ items, onRead, onDelete, onClose }) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
          <BellOff size={26} />
        </div>
        <h4 className="text-base font-bold text-slate-800">Chưa có notification nào</h4>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
          Khi có cập nhật mới từ dự án, organizer request hoặc hệ thống, chúng sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          onRead={onRead}
          onDelete={onDelete}
          onClose={onClose}
        />
      ))}
    </div>
  );
}