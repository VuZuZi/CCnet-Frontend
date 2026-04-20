import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupportedProjects } from "@/features/volunteer/hooks/useSupportedProjects";

import SupportedProjectsHero from "../components/supportedProjects/SupportedProjectsHero";
import SupportedProjectsSummary from "../components/supportedProjects/SupportedProjectsSummary";
import SupportedProjectsFilters from "../components/supportedProjects/SupportedProjectsFilters";
import SupportedProjectCard from "../components/supportedProjects/SupportedProjectCard";
import SupportedProjectsEmptyState from "../components/supportedProjects/SupportedProjectsEmptyState";
import SupportedProjectsSkeleton from "../components/supportedProjects/SupportedProjectsSkeleton";
import SupportedProjectsPagination from "../components/supportedProjects/SupportedProjectsPagination";

export function SupportedProjectsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [view, search]);

  const queryParams = useMemo(
    () => ({
      view,
      search,
      page,
      limit,
    }),
    [view, search, page]
  );

  const { data, isLoading, isFetching, isError } = useSupportedProjects(
    queryParams,
    true
  );

  const items = data?.data || [];
  const summary = data?.summary || {
    totalSupported: 0,
    joined: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
  };
  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  const isBusy = isLoading || isFetching;

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <SupportedProjectsHero
          totalSupported={summary.totalSupported}
          onBack={() => navigate("/profile")}
        />

        <SupportedProjectsSummary summary={summary} />

        <section className="rounded-[32px] border border-slate-200 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
          <SupportedProjectsFilters
            view={view}
            search={search}
            onViewChange={setView}
            onSearchChange={setSearch}
          />

          <div className="mt-6 space-y-4">
            {isBusy ? <SupportedProjectsSkeleton /> : null}

            {!isBusy && !items.length && !isError ? (
              <SupportedProjectsEmptyState />
            ) : null}

            {!isBusy && items.length > 0 ? (
              <div className="space-y-5">
                {items.map((item) => (
                  <SupportedProjectCard key={item.applicationId} item={item} />
                ))}
              </div>
            ) : null}
          </div>

          <SupportedProjectsPagination
            pagination={pagination}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </section>
      </div>
    </main>
  );
}

export default SupportedProjectsPage;