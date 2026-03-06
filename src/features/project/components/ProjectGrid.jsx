import { Spinner } from 'react-bootstrap';
import { FiFolder } from 'react-icons/fi';
import { ProjectCard } from './ProjectCard';
import styles from '../styles/ProjectListPage.module.css';

export function ProjectGrid({ projects, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <FiFolder size={36} />
        </div>
        <h3>No campaigns found</h3>
        <p>Be the first to create a campaign and make a difference!</p>
      </div>
    );
  }

  return (
    <div className={styles.projectsGrid}>
      {projects.map((project) => (
        <ProjectCard key={project.projectId || project._id} project={project} />
      ))}
    </div>
  );
}
