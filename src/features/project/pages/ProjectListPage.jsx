import { useEffect, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";

import {
  useExploreProjects,
  useFeaturedProject,
  useVolunteerNeededProjects,
  useProjectCategoryCounts,
} from "../hooks/useProjectQueries";
import { useMyFollowing } from "@/features/Community/hooks/useFollow";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { useDebounce } from "@/shared/hooks/useDebounce";

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

  const listSectionRef = useRef(null);
  const hasMountedRef = useRef(false);

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
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isError,
  } = useExploreProjects(filters);

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
    () => data?.pages?.flatMap((page) => page.projects || []) || [],
    [data],
  );

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
        featuredProject,
        filters,
        followedOrganizerIds,
      }),
    [projects, featuredProject, filters, followedOrganizerIds],
  );

  const isInitialLoading = !data && isLoading;

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
      <div className="py-20 text-center font-bold text-red-500">
        Đã có lỗi xảy ra khi tải dữ liệu!
      </div>
    );
  }

  return (
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
            <InfiniteScroll
              dataLength={visibleProjects.length}
              next={fetchNextPage}
              hasMore={Boolean(hasNextPage)}
              loader={
                <div className="col-span-full flex items-center justify-center gap-2 py-8 text-center font-medium text-slate-400">
                  <Loader2 className="animate-spin" size={16} />
                  Đang tải thêm dự án...
                </div>
              }
              endMessage={
                <div className="col-span-full py-10 text-center">
                  <span className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500">
                    Bạn đã xem hết danh sách dự án! 🎉
                  </span>
                </div>
              }
              className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3"
              style={{ overflow: "visible" }}
            >
              {visibleProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </main>
  );
}

export default ProjectListPage;