import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  PlusCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useWorkspaceProjects } from "../hooks/useProjectQueries";
import { PageLoader } from "@/shared/components/ui/PageLoader";

import WorkspaceSummaryStats from "../components/workspace/WorkspaceSummaryStats";
import WorkspaceDraftSection from "../components/workspace/WorkspaceDraftSection";
import WorkspaceProjectSection from "../components/workspace/WorkspaceProjectSection";
import WorkspaceAssignedNeedHelpSection from "../components/workspace/WorkspaceAssignedNeedHelpSection";
import {
  PAGE_SIZE,
  DRAFT_PAGE_SIZE,
  buildWorkspaceSummary,
  filterWorkspaceDraftProjects,
  filterWorkspaceProjects,
  paginateItems,
} from "../components/workspace/utils/workspaceProject.utils";

export function OrganizerWorkspacePage() {
  const [status, setStatus] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [projectType, setProjectType] = useState("ALL");
  const [volunteerMode, setVolunteerMode] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [draftKeyword, setDraftKeyword] = useState("");
  const [draftType, setDraftType] = useState("ALL");
  const [draftCurrentPage, setDraftCurrentPage] = useState(1);

  const { data, isLoading, isError } = useWorkspaceProjects({
    page: 1,
    limit: 100,
    status,
  });

  const {
    data: draftData,
    isLoading: isDraftLoading,
    isFetching: isDraftFetching,
  } = useWorkspaceProjects({
    page: 1,
    limit: 100,
    status: "DRAFT",
  });

  const projects = useMemo(() => {
    const allProjects = data?.projects || [];
    return allProjects.filter((project) => String(project?.status || "") !== "DRAFT");
  }, [data]);

  const draftProjects = useMemo(() => draftData?.projects || [], [draftData]);

  const filteredProjects = useMemo(
    () =>
      filterWorkspaceProjects({
        projects,
        keyword,
        projectType,
        volunteerMode,
      }),
    [projects, keyword, projectType, volunteerMode],
  );

  const filteredDraftProjects = useMemo(
    () =>
      filterWorkspaceDraftProjects({
        projects: draftProjects,
        keyword: draftKeyword,
        draftType,
      }),
    [draftProjects, draftKeyword, draftType],
  );

  const summary = useMemo(
    () =>
      buildWorkspaceSummary({
        filteredProjects,
        draftProjects,
      }),
    [filteredProjects, draftProjects],
  );

  const {
    totalPages,
    activePage: activeCurrentPage,
    items: paginatedProjects,
  } = useMemo(
    () => paginateItems(filteredProjects, currentPage, PAGE_SIZE),
    [filteredProjects, currentPage],
  );

  const {
    totalPages: draftTotalPages,
    activePage: activeDraftPage,
    items: paginatedDraftProjects,
  } = useMemo(
    () => paginateItems(filteredDraftProjects, draftCurrentPage, DRAFT_PAGE_SIZE),
    [filteredDraftProjects, draftCurrentPage],
  );

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleProjectTypeChange = (event) => {
    setProjectType(event.target.value);
    setCurrentPage(1);
  };

  const handleVolunteerModeChange = (event) => {
    setVolunteerMode(event.target.value);
    setCurrentPage(1);
  };

  const handleDraftKeywordChange = (event) => {
    setDraftKeyword(event.target.value);
    setDraftCurrentPage(1);
  };

  const handleDraftTypeChange = (event) => {
    setDraftType(event.target.value);
    setDraftCurrentPage(1);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-100 bg-white p-10 text-center text-red-500">
          Không thể tải dữ liệu khu vực làm việc.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-100 p-3">
                <BriefcaseBusiness className="text-amber-700" size={24} />
              </div>

              <div>
                <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
                  Khu vực làm việc của bạn
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  Khu vực làm việc của ban tổ chức
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Quản lý toàn bộ dự án của bạn tại một nơi: tạo mới, theo dõi trạng thái và điều phối các hoạt động.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/projects/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-600"
              >
                <PlusCircle size={16} />
                Tạo dự án mới
              </Link>
            </div>
          </div>
        </section>

        <WorkspaceSummaryStats summary={summary} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] xl:items-start">
          <div>
            <WorkspaceProjectSection
              filteredProjects={filteredProjects}
              paginatedProjects={paginatedProjects}
              keyword={keyword}
              onKeywordChange={handleKeywordChange}
              status={status}
              onStatusChange={handleStatusChange}
              projectType={projectType}
              onProjectTypeChange={handleProjectTypeChange}
              volunteerMode={volunteerMode}
              onVolunteerModeChange={handleVolunteerModeChange}
              activeCurrentPage={activeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          <div className="space-y-6 xl:sticky xl:top-24">
            <WorkspaceAssignedNeedHelpSection />

            <WorkspaceDraftSection
              isDraftLoading={isDraftLoading}
              isDraftFetching={isDraftFetching}
              filteredDraftProjects={filteredDraftProjects}
              paginatedDraftProjects={paginatedDraftProjects}
              draftKeyword={draftKeyword}
              onDraftKeywordChange={handleDraftKeywordChange}
              draftType={draftType}
              onDraftTypeChange={handleDraftTypeChange}
              activeDraftPage={activeDraftPage}
              draftTotalPages={draftTotalPages}
              onDraftPageChange={setDraftCurrentPage}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default OrganizerWorkspacePage;