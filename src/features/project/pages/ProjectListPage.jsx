import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useProjects } from '../hooks/useProjects';
import { ProjectSearchFilter, ProjectGrid } from '../components';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { Button } from '@/shared/components/ui/Button/Button';

export function ProjectListPage() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  const { projects, pagination, isLoading } = useProjects({
    page,
    limit: 12,
    status: statusFilter || undefined,
    sortBy,
    sortOrder: 'desc',
  });

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;

    const searchLower = search.toLowerCase();
    return projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower)
    );
  }, [projects, search]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen py-8 bg-off-white px-4 md:px-8">
      <div className="w-full max-w-[1200px] mx-auto">

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Discover Campaigns</h1>
              <p className="text-gray m-0">Find and support meaningful causes that make a difference</p>
            </div>
            {isAuthenticated && (
              <Link to={ROUTES.PROJECT_CREATE} className="no-underline w-full md:w-auto">
                <Button variant="yellow" className="w-full md:w-auto flex items-center justify-center gap-2">
                  <FiPlus size={18} />
                  Create Campaign
                </Button>
              </Link>
            )}
          </div>
        </div>

        <ProjectSearchFilter
          searchValue={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        <ProjectGrid
          projects={filteredProjects}
          isLoading={isLoading}
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-4">
            <Button
              variant="outlineDark"
              className="!py-1.5 !px-3 !text-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-black font-medium text-sm">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outlineDark"
              className="!py-1.5 !px-3 !text-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}