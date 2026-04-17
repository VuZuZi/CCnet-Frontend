import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  History,
  Loader2,
  Search,
  ShieldCheck,
  UserCircle2,
  CircleDot,
  FileText,
} from "lucide-react";

import httpClient from "@/shared/lib/httpClient";
import { useDebounce } from "@/shared/hooks/useDebounce";

const ACTION_META = {
  HELP_REQUEST_ASSIGNED: {
    label: "Đã giao",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  HELP_REQUEST_REASSIGNED: {
    label: "Giao lại",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  HELP_REQUEST_VERIFIED: {
    label: "Đã xác minh",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  HELP_REQUEST_REJECTED: {
    label: "Bị từ chối",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  HELP_REQUEST_STATUS_UPDATED: {
    label: "Cập nhật trạng thái",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  HELP_REQUEST_LINKED_PROJECT: {
    label: "Dự án liên kết",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
};

function formatLogDate(value) {
  if (!value) return "Không rõ thời gian";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatStatusLabel(value) {
  if (!value) return "--";
  return String(value).replaceAll("_", " ");
}

function SummaryCard({ icon: Icon, label, value, tone = "slate" }) {
  const toneMap = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.22)] ${
        toneMap[tone] || toneMap.slate
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
          {label}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-3 text-[34px] font-black leading-none tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InfoPill({ icon: Icon, children, tone = "slate" }) {
  const toneMap = {
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
        toneMap[tone] || toneMap.slate
      }`}
    >
      {Icon ? <Icon size={15} /> : null}
      {children}
    </span>
  );
}

function StatusDiff({ previousState, nextState }) {
  const prevStatus = previousState?.status || "";
  const nextStatus = nextState?.status || "";

  if (!prevStatus && !nextStatus) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Trạng thái
      </span>

      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
        {formatStatusLabel(prevStatus)}
      </span>

      <span className="text-slate-400">→</span>

      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
        {formatStatusLabel(nextStatus)}
      </span>
    </div>
  );
}

function LogCard({ log, isLast }) {
  const actionMeta = ACTION_META[log?.action] || {
    label: log?.action || "Không rõ",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };

  const actorName =
    log?.actorName ||
    log?.actorId?.fullName ||
    log?.metadata?.actorName ||
    log?.metadata?.adminName ||
    "Quản trị viên";

  const actorEmail =
    log?.actorEmail ||
    log?.actorId?.email ||
    log?.metadata?.actorEmail ||
    "";

  const targetTitle =
    log?.metadata?.helpRequestTitle ||
    log?.metadata?.title ||
    log?.metadata?.requestTitle ||
    "Yêu cầu NeedHelp";

  const organizerName = log?.metadata?.organizerName || "";
  const organizerEmail = log?.metadata?.organizerEmail || "";
  const requesterId = log?.metadata?.requesterId || "";
  const reason = log?.reason || log?.message || "";

  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-4 flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
          <CircleDot size={16} />
        </div>
        {!isLast ? (
          <div className="mt-2 h-full min-h-[120px] w-px bg-slate-200" />
        ) : null}
      </div>

      <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${actionMeta.className}`}
                >
                  {actionMeta.label}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                  <CalendarDays size={12} />
                  {formatLogDate(log?.createdAt)}
                </span>
              </div>

              <h3 className="mt-4 line-clamp-2 text-xl font-black tracking-tight text-slate-900">
                {targetTitle}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <InfoPill icon={UserCircle2}>{actorName}</InfoPill>

                {organizerName ? (
                  <InfoPill icon={UserCircle2} tone="amber">
                    Nhà tổ chức: {organizerName}
                  </InfoPill>
                ) : null}

                {requesterId ? (
                  <InfoPill icon={FileText}>ID người gửi: {requesterId}</InfoPill>
                ) : null}
              </div>
            </div>

            {log?.targetId ? (
              <Link
                to={`/admin/need-help/${log.targetId}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
              >
                Mở yêu cầu
                <ExternalLink size={16} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Admin
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {actorName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {actorEmail || "--"}
                </p>
              </div>

              {organizerName || organizerEmail ? (
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Organizer được giao
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {organizerName || "--"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {organizerEmail || "--"}
                  </p>
                </div>
              ) : null}

              {reason ? (
                <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                    Lý do / Ghi chú
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {reason}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Tóm tắt thay đổi
                </p>

                <div className="mt-3">
                  <StatusDiff
                    previousState={log?.previousState}
                    nextState={log?.nextState}
                  />
                </div>

                {log?.previousState?.assignedOrganizerId ||
                log?.nextState?.assignedOrganizerId ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Giao việc
                    </span>

                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600">
                      {log?.previousState?.assignedOrganizerId
                        ? "Đã có organizer"
                        : "Chưa có organizer"}
                    </span>

                    <span className="text-slate-400">→</span>

                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-semibold text-amber-700">
                      {log?.nextState?.assignedOrganizerId
                        ? "Đã giao"
                        : "Bỏ giao"}
                    </span>
                  </div>
                ) : null}
              </div>

              {(log?.previousState || log?.nextState) ? (
                <details className="group rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Chi tiết kỹ thuật
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
                  </summary>

                  <div className="mt-4 grid gap-4">
                    {log?.previousState ? (
                      <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Trạng thái trước
                        </p>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-700">
                          {JSON.stringify(log.previousState || {}, null, 2)}
                        </pre>
                      </div>
                    ) : null}

                    {log?.nextState ? (
                      <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Trạng thái sau
                        </p>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-700">
                          {JSON.stringify(log.nextState || {}, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function AdminNeedHelpActionLogsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "need-help-action-logs", debouncedSearch],
    queryFn: async () => {
      const response = await httpClient.get("/admin/action-logs", {
        params: {
          search: debouncedSearch || undefined,
          targetType: "help_request",
          limit: 50,
        },
      });

      return response.data?.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  });

  const logs = useMemo(() => {
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }, [data]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      assigned: logs.filter((item) =>
        ["HELP_REQUEST_ASSIGNED", "HELP_REQUEST_REASSIGNED"].includes(item.action)
      ).length,
      verified: logs.filter((item) => item.action === "HELP_REQUEST_VERIFIED")
        .length,
    };
  }, [logs]);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.18)]">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <Link
                to="/admin/need-help"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100"
              >
                <ArrowLeft size={16} />
                Quay lại NeedHelp
              </Link>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                <History size={14} />
                Nhật ký thao tác NeedHelp
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-[46px]">
                Lịch sử NeedHelp
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Theo dõi hoạt động kiểm duyệt, luồng giao việc cho organizer và
                các cập nhật quan trọng trong một dòng thời gian rõ ràng.
              </p>
            </div>

            <div className="grid auto-rows-fr gap-3 sm:grid-cols-3 xl:w-[520px]">
              <SummaryCard
                icon={ClipboardList}
                label="Nhật ký đã tải"
                value={stats.total}
                tone="amber"
              />
              <SummaryCard
                icon={History}
                label="Lượt giao việc"
                value={stats.assigned}
                tone="slate"
              />
              <SummaryCard
                icon={ShieldCheck}
                label="Đã xác minh"
                value={stats.verified}
                tone="emerald"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <label className="relative block">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tiêu đề yêu cầu, admin, organizer hoặc lý do..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />
        </label>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-amber-500" size={34} />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Đang tải nhật ký thao tác need help...
            </p>
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-[28px] border border-rose-200 bg-white px-6 py-14 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Không thể tải nhật ký
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {error?.message ||
              "Đã xảy ra lỗi ngoài dự kiến khi tải nhật ký thao tác."}
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <History size={24} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">
            Không tìm thấy nhật ký NeedHelp
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Khi thao tác kiểm duyệt NeedHelp của admin được ghi nhận, chúng sẽ
            xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <LogCard
              key={log._id || `${log.action}-${log.createdAt}`}
              log={log}
              isLast={index === logs.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminNeedHelpActionLogsPage;