import { FolderKanban } from "lucide-react";

export function SupportedProjectsEmptyState() {
  return (
    <div className="rounded-[30px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <FolderKanban className="mx-auto text-slate-400" size={42} />
      <h3 className="mt-4 text-xl font-black text-slate-900">
        Chưa có dự án nào phù hợp
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm. Khi đơn tình nguyện được
        duyệt, dự án sẽ xuất hiện tại đây.
      </p>
    </div>
  );
}

export default SupportedProjectsEmptyState;