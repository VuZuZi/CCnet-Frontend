import { useMemo, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

export function TabStory({ project }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = useMemo(() => {
    return Boolean(project?.description && String(project.description).trim());
  }, [project]);

  return (
    <div
      className={`relative rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 sm:p-8 lg:p-10 ${
        !isExpanded ? "max-h-[640px] overflow-hidden" : ""
      }`}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#F59E0B]">
          <FileText size={18} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">Project Story</h3>
          <p className="text-sm text-slate-500">
            Thông tin chi tiết và câu chuyện của dự án
          </p>
        </div>
      </div>

      <div
        className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-a:text-[#F59E0B]"
        dangerouslySetInnerHTML={{
          __html: hasContent
            ? project.description
            : "<p>Chưa có thông tin chi tiết.</p>",
        }}
      />

      {!isExpanded && (
        <div className="absolute bottom-0 left-0 flex h-44 w-full items-end justify-center bg-gradient-to-t from-white via-white/90 to-transparent pb-8 pt-12">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/30 bg-[#FFFBEB] px-6 py-3 text-sm font-bold text-[#B45309] shadow-sm transition hover:-translate-y-0.5 hover:border-[#FBBF24] hover:bg-[#FFF7D6]"
          >
            Read More
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default TabStory;