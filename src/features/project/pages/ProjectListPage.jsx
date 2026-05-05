import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import {
  PROJECT_EXPLORE_PAGE_SIZE,
  useExploreProjectsPage,
  useFeaturedProject,
  useVolunteerNeededProjects,
  useProjectCategoryCounts,
} from "../hooks/useProjectQueries";
import { useMyFollowing } from "@/features/Community/hooks/useFollow";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { LandingFooter } from "@/features/landing/components/LandingFooter";

import { OrganizerWorkspaceBar } from "../components/OrganizerWorkspaceBar";
import FeaturedProject from "../components/FeaturedProject";
import { CategoryExplore } from "../components/CategoryExplore";
import VolunteerCall from "../components/VolunteerCall";
import ProjectFilterBar from "../components/ProjectFilterBar";
import ProjectCard from "../components/ProjectCard";
import {
  buildVisibleProjects,
  extractFollowedOrganizerId,
  extractFollowingList,
  mergeUniqueProjects,
  normalizeProjectId,
} from "../utils/projectDisplay.utils";

const DEFAULT_FILTERS = {
  category: "",
  location: "",
  organizerScope: "ALL",
};

export function ProjectListPage() {
  const [localLocation, setLocalLocation] = useState("");
  const debouncedLocation = useDebounce(localLocation, 300);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pageState, setPageState] = useState({ value: 1, filterKey: null });

  const listSectionRef = useRef(null);
  const hasMountedRef = useRef(false);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const activePage = pageState.filterKey === filterKey ? pageState.value : 1;

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setFilters((prev) => {
      const nextLocation = debouncedLocation.trim();
      if (prev.location === nextLocation) return prev;

      return {
        ...prev,
        location: nextLocation,
      };
    });
  }, [debouncedLocation]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useExploreProjectsPage(filters, activePage, PROJECT_EXPLORE_PAGE_SIZE);

  const { data: featuredProject, isLoading: isFeaturedLoading } =
    useFeaturedProject();

  const { data: volunteerProjects = [] } = useVolunteerNeededProjects();

  const { countsByCategory, isLoading: isCountsLoading } =
    useProjectCategoryCounts({
      location: filters.location,
      organizerScope: filters.organizerScope,
    });

  const { data: myFollowingData } = useMyFollowing(50);

  const projects = useMemo(
    () => data?.projects || [],
    [data],
  );

  const pagination = data?.pagination || {};
  const currentPage = Number(pagination?.currentPage || activePage);
  const totalPages = Math.max(1, Number(pagination?.totalPages || 1));
  const totalItems = Number(pagination?.totalItems || projects.length || 0);

  const featuredPool = useMemo(() => {
    const featuredList = featuredProject ? [featuredProject] : [];
    return mergeUniqueProjects(featuredList, projects);
  }, [featuredProject, projects]);

  const followedOrganizerIds = useMemo(() => {
    const rawList = extractFollowingList(myFollowingData);
    return rawList.map(extractFollowedOrganizerId).filter(Boolean);
  }, [myFollowingData]);

  const visibleProjects = useMemo(
    () =>
      buildVisibleProjects({
        projects,
        featuredProject: null,
        filters,
        followedOrganizerIds,
      }),
    [projects, filters, followedOrganizerIds],
  );

  const isInitialLoading = !data && isLoading;

  useEffect(() => {
    if (activePage <= totalPages) return;
    setPageState({ value: totalPages, filterKey });
  }, [activePage, filterKey, totalPages]);

  const scrollToProjectList = () => {
    if (!listSectionRef.current) return;

    const navbarOffset = 110;
    const extraSpacing = 12;
    const rect = listSectionRef.current.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const targetTop = Math.max(absoluteTop - navbarOffset - extraSpacing, 0);

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  };

  const updateFiltersWithScroll = (updater) => {
    scrollToProjectList();

    requestAnimationFrame(() => {
      setFilters((prev) => updater(prev));
    });
  };

  const handleApplyLocation = () => {
    setFilters((prev) => ({
      ...prev,
      location: localLocation.trim(),
    }));
  };

  const handleCategoryChange = (event) => {
    const nextCategory = event.target.value;

    updateFiltersWithScroll((prev) => ({
      ...prev,
      category: nextCategory,
    }));
  };

  const handleOrganizerScopeChange = (event) => {
    const nextScope = event.target.value;

    updateFiltersWithScroll((prev) => ({
      ...prev,
      organizerScope: nextScope,
    }));
  };

  const handleCategorySelect = (categoryValue) => {
    updateFiltersWithScroll((prev) => ({
      ...prev,
      category: prev.category === categoryValue ? "" : categoryValue,
    }));
  };

  const handleClearFilters = () => {
    setLocalLocation("");

    updateFiltersWithScroll(() => DEFAULT_FILTERS);
  };

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setPageState({ value: safePage, filterKey });

    requestAnimationFrame(() => {
      scrollToProjectList();
    });
  };

  const handleShareFeaturedProject = async (project) => {
    const projectId = normalizeProjectId(project?._id || project?.id);
    if (!projectId) return;

    const shareUrl = `${window.location.origin}/projects/${projectId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error("Copy share link failed:", error);
    }
  };

  if (isInitialLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <>
        <main className="min-h-screen bg-slate-50 px-4 py-20 text-center font-bold text-red-500 sm:px-6 lg:px-8">
          Đã có lỗi xảy ra khi tải dữ liệu!
        </main>
        <LandingFooter />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <OrganizerWorkspaceBar />

          {!isFeaturedLoading && featuredPool.length > 0 ? (
            <FeaturedProject
              projects={featuredPool}
              followedOrganizerIds={followedOrganizerIds}
              onShare={handleShareFeaturedProject}
            />
          ) : null}

          <CategoryExplore
            activeCategory={filters.category}
            onCategorySelect={handleCategorySelect}
            countsByCategory={countsByCategory}
            isCountsLoading={isCountsLoading}
          />

          <VolunteerCall projects={volunteerProjects} />

          <div ref={listSectionRef} className="mt-16">
            <ProjectFilterBar
              localLocation={localLocation}
              setLocalLocation={setLocalLocation}
              filters={filters}
              onCategoryChange={handleCategoryChange}
              onOrganizerScopeChange={handleOrganizerScopeChange}
              onApplyLocation={handleApplyLocation}
              isFetching={isFetching}
            />

            {visibleProjects.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <p className="text-lg font-medium text-slate-500">
                  Không tìm thấy dự án nào phù hợp với bộ lọc.
                </p>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 rounded-full bg-slate-100 px-6 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                {isFetching && !isLoading ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                    <Loader2 className="animate-spin text-amber-500" size={16} />
                    Đang cập nhật danh sách...
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {visibleProjects.map((project) => (
                    <ProjectCard
                      key={project._id || project.id}
                      project={project}
                    />
                  ))}
                </div>

                <ProjectListPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={PROJECT_EXPLORE_PAGE_SIZE}
                  onPageChange={handlePageChange}
                  isFetching={isFetching}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}

function getVisiblePageNumbers(currentPage, totalPages, windowSize = 5) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + windowSize - 1);
  const adjustedStart = Math.max(1, end - windowSize + 1);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

function ProjectListPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isFetching,
}) {
  if (!totalItems) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = getVisiblePageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm font-semibold text-slate-500">
        Hiển thị {from} - {to} trên tổng {totalItems} dự án
      </p>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Trước
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={isFetching}
              className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
                pageNumber === currentPage
                  ? "bg-amber-400 text-slate-900"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ProjectListPage;
