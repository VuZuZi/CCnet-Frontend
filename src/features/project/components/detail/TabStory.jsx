import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpenText } from "lucide-react";

const EMPTY_STORY_HTML = "<p>Chưa có thông tin chi tiết.</p>";

export function TabStory({ project }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-amber-700">
            <BookOpenText size={14} />
            Câu chuyện dự án
          </div>
        </div>

        <div
          className={`relative min-w-0 overflow-hidden rounded-2xl bg-slate-50/70 p-4 transition-all duration-300 sm:p-6 ${
            !isExpanded ? "max-h-[540px]" : ""
          }`}
        >
          <div
            className="prose prose-slate max-w-none text-[15px] leading-7 text-slate-700 [&_*]:max-w-full [&_*]:break-words [&_*]:whitespace-pre-wrap [&_*]:[overflow-wrap:anywhere] [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto"
            dangerouslySetInnerHTML={{
              __html: project?.description || EMPTY_STORY_HTML,
            }}
          />

          {!isExpanded ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent" />
          ) : null}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {isExpanded ? "Thu gọn nội dung" : "Đọc thêm"}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TabStory;