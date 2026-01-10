import { useState, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useProjects } from '../hooks/useProjects';
import { ProjectFilters } from '../components/ProjectFilters';
import { ProjectList } from '../components/ProjectList';
import styles from '../styles/ProjectOverview.module.css';

const DEFAULT_FILTERS = {
  type: 'all',
  status: 'all',
  q: ''
};

export function ProjectOverview() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const queryFilters = useMemo(() => ({
    type: filters.type,
    status: filters.status,
    q: filters.q
  }), [filters]);

  const { data: projects, isLoading } = useProjects(queryFilters);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Container style={{ maxWidth: 'var(--container-max)' }}>
          <p className={styles.heroTag}>Community Projects</p>
          <h1 className="fw-bold mb-2">Project Overview</h1>
          <p className="text-muted mb-0">
            Xem lại các dự án bạn đã tham gia hoặc tự tổ chức.
          </p>
        </Container>
      </div>

      <Container style={{ maxWidth: 'var(--container-max)' }} className="pb-5">
        <ProjectFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />

        <ProjectList projects={projects} isLoading={isLoading} />
      </Container>
    </div>
  );
}

export default ProjectOverview;
