import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useProjectDetail } from "@/features/project/hooks/useProjectQueries";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { PageLoader } from "@/shared/components/ui/PageLoader";

import { ProjectCover } from "@/features/project/components/detail/ProjectCover";
import { ProjectHeader } from "@/features/project/components/detail/ProjectHeader";
import { ProjectTabs } from "@/features/project/components/detail/ProjectTabs";
import { TabStory } from "@/features/project/components/detail/TabStory";
import { SidebarPublic } from "@/features/project/components/detail/SidebarPublic";

const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  PENDING_APPROVAL: "bg-[#FFFBEB] text-[#B45309] border-[#FBBF24]/35",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PAUSED: "bg-orange-100 text-orange-700 border-orange-200",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminProjectPreviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useProjectDetail(id);
  const { updateProjectStatus } = useAdminDashboard("projects");

  const [activeTab, setActiveTab] = useState("story");
  const [isHighlighted, setIsHighlighted] = useState(false);

  const highlightFromNotification = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("highlight") === "1";
  }, [location.search]);

  useEffect(() => {
    if (!highlightFromNotification) return;
    setIsHighlighted(true);

    const timer = setTimeout(() => {
      setIsHighlighted(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, [highlightFromNotification]);

  const handleApprove = async () => {
    await updateProjectStatus(id, "ACTIVE");
  };

  const handleReject = async () => {
    await updateProjectStatus(id, "CANCELLED");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "story":
        return <TabStory project={project} />;
      case "financials":
        return (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-[#FFFBEB] text-sm font-semibold text-slate-500">
              Nội dung Financial Management đang được xây dựng...
            </div>
          </div>
        );
      case "community":
        return (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-[#FFFBEB] text-sm font-semibold text-slate-500">
              Nội dung Community Feed đang được xây dựng...
            </div>
          </div>
        );
      default:
        return <TabStory project={project} />;
    }
  };

  if (isLoading) return <PageLoader />;

  if (isError || !project) {
    return (
      <div className="rounded-[28px] border border-red-100 bg-white p-10 text-center text-red-500 shadow-sm">
        Không tìm thấy dự án.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/projects")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/30 bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B45309]">
              <ShieldCheck size={11} />
              Admin Project Preview
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Review project submission
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Xem lại thông tin dự án trước khi phê duyệt hoặc từ chối.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${
              STATUS_STYLES[project.status] ||
              "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {project.status}
          </span>

          {project.status === "PENDING_APPROVAL" && (
            <>
              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                <CheckCircle2 size={16} />
                Approve
              </button>

              <button
                type="button"
                onClick={handleReject}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-600"
              >
                <XCircle size={16} />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className={`rounded-[32px] transition-all duration-500 ${
          isHighlighted
            ? "ring-4 ring-[#FBBF24]/35 shadow-[0_0_0_10px_rgba(251,191,36,0.08)]"
            : ""
        }`}
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.65fr_0.95fr]">
          <div className="space-y-8">
            <ProjectCover project={project} isOrganizer={false} />
            <ProjectHeader project={project} isOrganizer={false} />

            <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
              <ProjectTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOrganizer={false}
              />
            </div>

            {renderTabContent()}
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#F59E0B]">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Submission summary
                  </h3>
                  <p className="text-sm text-slate-500">
                    Tóm tắt nhanh cho admin review
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Project title
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{project.title}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Category
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {project.category || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Organizer
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {project.organizerId?.fullName || "Unknown organizer"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {project.organizerId?.email || ""}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Documents
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {project.documents?.length || 0} file(s)
                  </p>
                </div>
              </div>
            </div>

            <SidebarPublic project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}