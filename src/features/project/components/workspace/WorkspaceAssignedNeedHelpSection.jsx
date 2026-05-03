import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Check,
  ExternalLink,
  FolderKanban,
  Loader2,
  MapPin,
  Sparkles,
  X as XIcon,
} from "lucide-react";

import { useOrganizerAssignedRequests } from "@/features/needHelp/hooks/useHelpRequestQueries";
import { useRespondHelpRequestAssignment } from "@/features/needHelp/hooks/useHelpRequestMutations";
import { formatDate } from "@/shared/lib/formatters";

const STATUS_TABS = [
  {
    key: "pending",
    label: "Đang chờ",
    helper: "Các yêu cầu quản trị viên vừa gợi ý cho bạn.",
  },
  {
    key: "accepted",
    label: "Đã nhận",
    helper: "Các yêu cầu bạn đang xử lý.",
  },
];

const URGENCY_STYLES = {
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const CATEGORY_LABELS = {
  Y_TE: "Hỗ trợ y tế",
  GIAO_DUC: "Giáo dục",
  THIEN_TAI: "Thiên tai",
  XAY_DUNG: "Xây dựng",
  MOI_TRUONG: "Môi trường",
  KHAC: "Khác",
};

const ASSIGNED_ITEMS_PER_PAGE = 5;

function extractHelpRequestCover(item) {
  const evidences = Array.isArray(item?.evidences) ? item.evidences : [];
  const imageEvidence = evidences.find(
    (evidence) => evidence?.mediaType === "image" || !evidence?.mediaType,
  );
  return imageEvidence?.url || null;
}

function EmptyState({ activeTab }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400">
        <FolderKanban size={20} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">
        {activeTab === "pending"
          ? "Không có yêu cầu mới đang chờ phản hồi."
          : "Bạn chưa nhận yêu cầu nào để xử lý."}
      </p>
    </div>
  );
}

function AssignmentCard({ item, activeTab, isResponding, onAccept, onReject }) {
  const coverUrl = extractHelpRequestCover(item);
  const urgencyClass = URGENCY_STYLES[item?.urgencyLevel] || URGENCY_STYLES.MEDIUM;
  const categoryLabel = CATEGORY_LABELS[item?.category] || "Khác";
  const linkedProjectId =
    typeof item?.linkedProjectId === "object" ? item?.linkedProjectId?._id : item?.linkedProjectId;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={item?.title || "Ảnh yêu cầu"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
              Need Help
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${urgencyClass}`}
            >
              {item?.urgencyLevel || "MEDIUM"}
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {categoryLabel}
            </span>
          </div>

          <p className="line-clamp-1 text-sm font-bold text-slate-900">
            {item?.title || "Yêu cầu chưa có tiêu đề"}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              <span className="line-clamp-1">{item?.location?.address || "Không có địa điểm"}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} />
              {formatDate(item?.createdAt) || "Gần đây"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        {activeTab === "pending" ? (
          <>
            <button
              type="button"
              onClick={() => onAccept(item?._id)}
              disabled={isResponding}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResponding ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Nhận việc
            </button>

            <button
              type="button"
              onClick={() => onReject(item?._id)}
              disabled={isResponding}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <XIcon size={12} />
              Từ chối
            </button>
          </>
        ) : null}

        {activeTab === "accepted" ? (
          <>
            {linkedProjectId ? (
              <Link
                to={`/projects/${linkedProjectId}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-800"
              >
                <ExternalLink size={12} />
                Xem dự án
              </Link>
            ) : (
              <Link
                to={`/projects/create?helpRequestId=${item?._id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                <ExternalLink size={12} />
                Tạo dự án
              </Link>
            )}
          </>
        ) : null}

        <Link
          to={`/need-help/${item?._id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Chi tiết
        </Link>
      </div>
    </article>
  );
}

export function WorkspaceAssignedNeedHelpSection() {
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useOrganizerAssignedRequests(
    {
      limit: 50,
      sortBy: "assignedAt",
    },
    true,
  );
  const respondMutation = useRespondHelpRequestAssignment();

  const allItems = data?.data || [];
  const pendingItems = allItems.filter((item) => item?.status === "VERIFIED");
  const acceptedItems = allItems.filter((item) => item?.status === "IN_PROGRESS");
  const displayItems = activeTab === "pending" ? pendingItems : acceptedItems;
  const totalPages = Math.max(1, Math.ceil(displayItems.length / ASSIGNED_ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * ASSIGNED_ITEMS_PER_PAGE;
  const paginatedItems = displayItems.slice(startIndex, startIndex + ASSIGNED_ITEMS_PER_PAGE);

  const handleRespond = async (id, action) => {
    if (!id || respondMutation.isPending) return;
    await respondMutation.mutateAsync({ id, action });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
            <Sparkles size={12} />
            Quản trị viên đã gợi ý
          </p>
          <h2 className="mt-2 text-lg font-black tracking-tight text-slate-900">
            Yêu cầu hỗ trợ được gợi ý
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Xử lý nhanh yêu cầu mà không cần rời workspace.
          </p>
        </div>

        <Link
          to="/organizer/need-help"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ExternalLink size={13} />
          Mở trang đầy đủ
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === "pending" ? pendingItems.length : acceptedItems.length;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-amber-400 text-slate-950"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-800"
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-white/80 text-slate-950" : "bg-slate-200 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-xs text-slate-500">
        {STATUS_TABS.find((tab) => tab.key === activeTab)?.helper}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-10 text-slate-500">
          <Loader2 className="animate-spin" size={18} />
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((item) => (
            <AssignmentCard
              key={item._id}
              item={item}
              activeTab={activeTab}
              isResponding={respondMutation.isPending}
              onAccept={(id) => handleRespond(id, "accept")}
              onReject={(id) => handleRespond(id, "reject")}
            />
          ))}

          {displayItems.length > ASSIGNED_ITEMS_PER_PAGE ? (
            <div className="mt-1 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Trang {activePage}/{totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={activePage <= 1}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={activePage >= totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default WorkspaceAssignedNeedHelpSection;
