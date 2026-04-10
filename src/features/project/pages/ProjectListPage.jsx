import { useEffect, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";

import {
  useExploreProjects,
  useFeaturedProject,
  useVolunteerNeededProjects,
  useProjectCategoryCounts,
} from "../hooks/useProjectQueries";
import { useMyFollowing } from "@/features/community/hooks/useFollow";
import { PageLoader } from "@/shared/components/ui/PageLoader";
import { useDebounce } from "@/shared/hooks/useDebounce";

import { OrganizerWorkspaceBar } from "../components/OrganizerWorkspaceBar";
import FeaturedProject from "../components/FeaturedProject";
import { CategoryExplore } from "../components/CategoryExplore";
import VolunteerCall from "../components/VolunteerCall";
import ProjectFilterBar from "../components/ProjectFilterBar";
import ProjectCard from "../components/ProjectCard";

function normalizeId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || value.toString?.() || "";
  return "";
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function mergeUniqueProjects(primaryProjects = [], extraProjects = []) {
  const map = new Map();

  [...primaryProjects, ...extraProjects].forEach((project) => {
    const id = normalizeId(project?._id || project?.id);
    if (!id) return;
    if (!map.has(id)) {
      map.set(id, project);
    }
  });

  return Array.from(map.values());
}

function extractFollowingList(payload) {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.following)) return payload.following;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.docs)) return payload.docs;

  if (Array.isArray(payload?.data?.following)) return payload.data.following;
  if (Array.isArray(payload?.data?.users)) return payload.data.users;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.docs)) return payload.data.docs;

  return [];
}

function extractFollowedOrganizerId(item) {
  return normalizeId(
    item?.followingId?._id ||
      item?.followingId?.id ||
      item?.followingId ||
      item?.user?._id ||
      item?.user?.id ||
      item?.userId?._id ||
      item?.userId?.id ||
      item?.userId ||
      item?._id ||
      item?.id
  );
}

function matchesProjectFilters(project, filters, followedOrganizerIds) {
  if (!project) return false;

  const organizerId = normalizeId(project?.organizerId);
  const followedSet = new Set((followedOrganizerIds || []).filter(Boolean));

  if (filters.organizerScope === "FOLLOWED") {
    if (!organizerId || !followedSet.has(organizerId)) {
      return false;
    }
  }

  if (filters.category && project?.category !== filters.category) {
    return false;
  }

  const keyword = normalizeText(filters.location);
  if (keyword) {
    const locationText = normalizeText(project?.location?.address || "");
    if (!locationText.includes(keyword)) {
      return false;
    }
  }

  return true;
}

function buildVisibleProjects({ projects, featuredProject, filters, followedOrganizerIds }) {
  const followedSet = new Set((followedOrganizerIds || []).filter(Boolean));
  const seen = new Set();
  const result = [];

  const pushUnique = (project) => {
    if (!project) return;
    const id = normalizeId(project?._id || project?.id);
    if (!id || seen.has(id)) return;
    seen.add(id);
    result.push(project);
  };

  const filteredProjects = (projects || []).filter((project) =>
    matchesProjectFilters(project, filters, followedOrganizerIds)
  );

  const followedProjects = filteredProjects.filter((project) => {
    const organizerId = normalizeId(project?.organizerId);
    return organizerId && followedSet.has(organizerId);
  });

  const otherProjects = filteredProjects.filter((project) => {
    const organizerId = normalizeId(project?.organizerId);
    return !organizerId || !followedSet.has(organizerId);
  });

  const featuredMatches = matchesProjectFilters(
    featuredProject,
    filters,
    followedOrganizerIds
  );

  if (filters.organizerScope === "FOLLOWED") {
    followedProjects.forEach(pushUnique);
    if (featuredMatches) pushUnique(featuredProject);
    return result;
  }

  followedProjects.forEach(pushUnique);
  if (featuredMatches) pushUnique(featuredProject);
  otherProjects.forEach(pushUnique);

  return result;
}

export function ProjectListPage() {
  const [localLocation, setLocalLocation] = useState("");
  const debouncedLocation = useDebounce(localLocation, 300);

  const [filters, setFilters] = useState({
    category: "",
    location: "",
    organizerScope: "ALL",
  });

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

  const {
    data: featuredProject,
    isLoading: isFeaturedLoading,
  } = useFeaturedProject();

  const { data: volunteerProjects = [] } = useVolunteerNeededProjects();

  const {
    countsByCategory,
    isLoading: isCountsLoading,
  } = useProjectCategoryCounts({
    location: filters.location,
    organizerScope: filters.organizerScope,
  });

  const { data: myFollowingData } = useMyFollowing(50);

  const projects = useMemo(() => {
    return data?.pages?.flatMap((page) => page.projects || []) || [];
  }, [data]);

  const featuredPool = useMemo(() => {
    const featuredList = featuredProject ? [featuredProject] : [];
    return mergeUniqueProjects(featuredList, projects);
  }, [featuredProject, projects]);

  const followedOrganizerIds = useMemo(() => {
    const rawList = extractFollowingList(myFollowingData);
    return rawList.map(extractFollowedOrganizerId).filter(Boolean);
  }, [myFollowingData]);

  const visibleProjects = useMemo(() => {
    return buildVisibleProjects({
      projects,
      featuredProject,
      filters,
      followedOrganizerIds,
    });
  }, [projects, featuredProject, filters, followedOrganizerIds]);

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

  const handleApplyLocation = () => {
    setFilters((prev) => ({
      ...prev,
      location: localLocation.trim(),
    }));
  };

  const handleCategoryChange = (e) => {
    const nextCategory = e.target.value;

    scrollToProjectList();

    requestAnimationFrame(() => {
      setFilters((prev) => ({
        ...prev,
        category: nextCategory,
      }));
    });
  };

  const handleOrganizerScopeChange = (e) => {
    const nextScope = e.target.value;

    scrollToProjectList();

    requestAnimationFrame(() => {
      setFilters((prev) => ({
        ...prev,
        organizerScope: nextScope,
      }));
    });
  };

  const handleCategorySelect = (categoryValue) => {
    const nextCategory =
      filters.category === categoryValue ? "" : categoryValue;

    scrollToProjectList();

    requestAnimationFrame(() => {
      setFilters((prev) => ({
        ...prev,
        category: nextCategory,
      }));
    });
  };

  const handleClearFilters = () => {
    setLocalLocation("");

    scrollToProjectList();

    requestAnimationFrame(() => {
      setFilters({
        category: "",
        location: "",
        organizerScope: "ALL",
      });
    });
  };

  const handleShareFeaturedProject = async (project) => {
    const projectId = normalizeId(project?._id || project?.id);
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

        {!isFeaturedLoading && featuredPool.length > 0 && (
          <FeaturedProject
            projects={featuredPool}
            followedOrganizerIds={followedOrganizerIds}
            onShare={handleShareFeaturedProject}
          />
        )}

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
              hasMore={!!hasNextPage}
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