import { MessageCircleMore } from 'lucide-react';

export default function ChatEmptyState() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-[#f6f7fb] p-6">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <MessageCircleMore className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-900">
          Chọn một đoạn chat
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Hãy chọn một cuộc trò chuyện ở bên trái để bắt đầu nhắn tin, xem tệp,
          hình ảnh và quản lý nhóm.
        </p>
      </div>
    </div>
  );
}