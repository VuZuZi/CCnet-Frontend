import { useState, useMemo, useCallback } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useProjects } from '../hooks/useProjects';
import { ProjectSearchFilter, ProjectGrid } from '../components';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import styles from '../styles/ProjectListPage.module.css';

export function ProjectListPage() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  
  // Local filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  // Fetch projects with filters
  const { projects, pagination, isLoading } = useProjects({
    page,
    limit: 12,
    status: statusFilter || undefined,
    sortBy,
    sortOrder: 'desc',
  });

  // Filter projects by search (client-side for now)
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
    <div className={styles.pageContainer}>
      <Container>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1>Discover Campaigns</h1>
              <p>Find and support meaningful causes that make a difference</p>
            </div>
            {isAuthenticated && (
              <Link to={ROUTES.PROJECT_CREATE}>
                <Button className={styles.btnCreate}>
                  <FiPlus size={18} />
                  Create Campaign
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <ProjectSearchFilter
          searchValue={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* Projects Grid */}
        <ProjectGrid 
          projects={filteredProjects} 
          isLoading={isLoading} 
        />

        {/* Pagination could be added here */}
        {pagination && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            {/* Simple pagination - can be enhanced */}
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="mx-3">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}
