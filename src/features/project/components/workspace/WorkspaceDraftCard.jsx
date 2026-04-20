import { Link } from "react-router-dom";
import { ArrowRight, ImageOff } from "lucide-react";

import {
  formatProjectDate,
  getProjectFundingStats,
} from "@/features/project/utils/projectDisplay.utils";
import {
  formatWorkspaceMoney,
  getWorkspaceProjectCoverUrl,
  getWorkspaceTypeLabel,
} from "./utils/workspaceProject.utils";

export function WorkspaceDraftCard({ draft }) {
  const { currentAmount, targetAmount } = getProjectFundingStats(draft);
  const coverUrl = getWorkspaceProjectCoverUrl(draft);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="w-[88px] shrink-0">
          <div className="aspect-square overflow-hidden rounded-xl border border-amber-200 bg-white">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={draft?.title || "Ảnh bản nháp"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-amber-100 to-amber-200 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700">
                <ImageOff size={14} />
                Chưa có ảnh bìa
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="break-all text-base font-bold text-slate-900">
                {draft.title || "Bản nháp chưa có tiêu đề"}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Cập nhật: {formatProjectDate(draft.updatedAt || draft.createdAt)}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-bold text-amber-700">
              BẢN NHÁP
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="inline-flex max-w-full rounded-full border border-slate-200 bg-white px-2 py-1">
              <span className="truncate">{getWorkspaceTypeLabel(draft?.projectType)}</span>
            </span>
            <span className="inline-flex max-w-full rounded-full border border-slate-200 bg-white px-2 py-1">
              <span className="truncate">{draft?.category || "Chưa phân loại"}</span>
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
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
      </div>
    </div>
  );
}

export default WorkspaceDraftCard;