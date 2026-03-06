import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiShare2, FiHeart } from 'react-icons/fi';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { ProjectHeader, ProjectInfo } from '../components';
import { ROUTES } from '@/shared/constants/routes';
import styles from '../styles/ProjectDetailPage.module.css';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { project, isLoading, isError, error } = useProjectDetail(id);

  // Loading State
  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Container>
          <div className={styles.loadingContainer}>
            <Spinner animation="border" variant="warning" />
            <p className="mt-3 text-muted">Loading campaign details...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className={styles.pageContainer}>
        <Container>
          <div className={styles.errorContainer}>
            <FiAlertCircle size={48} className="text-danger" />
            <h3>Oops! Something went wrong</h3>
            <p className="text-muted">
              {error?.message || 'Failed to load campaign details'}
            </p>
            <Link to={ROUTES.PROJECTS}>
              <Button variant="outline-secondary">
                <FiArrowLeft size={16} className="me-2" />
                Back to Campaigns
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // Not Found State
  if (!project) {
    return (
      <div className={styles.pageContainer}>
        <Container>
          <div className={styles.errorContainer}>
            <FiAlertCircle size={48} className="text-warning" />
            <h3>Campaign Not Found</h3>
            <p className="text-muted">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <Link to={ROUTES.PROJECTS}>
              <Button variant="outline-secondary">
                <FiArrowLeft size={16} className="me-2" />
                Back to Campaigns
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Container>
        {/* Back Button */}
        <Link to={ROUTES.PROJECTS} className={styles.backButton}>
          <FiArrowLeft size={18} />
          <span>Back to Campaigns</span>
        </Link>

        {/* Project Header */}
        <ProjectHeader project={project} />

        {/* Action Buttons */}
        <div className={`${styles.actionButtons} mb-4`}>
          <Button className={styles.btnPrimary}>
            <FiHeart size={16} className="me-2" />
            Support Campaign
          </Button>
          <Button className={styles.btnOutline}>
            <FiShare2 size={16} className="me-2" />
            Share
          </Button>
        </div>

        {/* Project Info */}
        <ProjectInfo project={project} />

        {/* Posts Section Placeholder */}
        {/* This will be handled by another branch */}
      </Container>
    </div>
  );
}
