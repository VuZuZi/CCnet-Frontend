import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import {
  formatProjectDate,
  getProjectFundingStats,
} from "@/features/project/utils/projectDisplay.utils";
import {
  formatWorkspaceMoney,
  getWorkspaceTypeLabel,
} from "./utils/workspaceProject.utils";

export function WorkspaceDraftCard({ draft }) {
  const { currentAmount, targetAmount } = getProjectFundingStats(draft);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-slate-900">
            {draft.title || "Draft chưa có tiêu đề"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Cập nhật: {formatProjectDate(draft.updatedAt || draft.createdAt)}
          </p>
        </div>

        <span className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-bold text-amber-700">
          DRAFT
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
          {getWorkspaceTypeLabel(draft?.projectType)}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
          {draft?.category || "Chưa phân loại"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-600">
          {formatWorkspaceMoney(currentAmount)} / {formatWorkspaceMoney(targetAmount)}
        </p>

        <Link
          to={`/projects/create/${draft._id}/edit`}
          className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          Tiếp tục điền
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default WorkspaceDraftCard;