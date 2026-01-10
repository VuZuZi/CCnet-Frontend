import { Row, Col, Card, Badge, ProgressBar, Alert } from 'react-bootstrap';
import styles from '../styles/ProjectOverview.module.css';

export function ProjectList({ projects, isLoading }) {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Alert variant="light" className={styles.emptyAlert}>
        <p className="mb-0 text-muted">Không có project nào phù hợp với bộ lọc.</p>
      </Alert>
    );
  }

  return (
    <Row className="g-4">
      {projects.map((project) => (
        <Col key={project._id} md={6} lg={4}>
          <ProjectCard project={project} />
        </Col>
      ))}
    </Row>
  );
}

function ProjectCard({ project }) {
  const progress = calculateProgress(project.current_amount, project.financial_goal);
  const statusVariant = project.status === 'completed' ? 'success' : 'primary';

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <Card className={styles.projectCard}>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className={styles.projectTitle}>{project.title}</Card.Title>
          <Badge bg={statusVariant} className={styles.statusBadge}>
            {project.status === 'completed' ? 'Hoàn thành' : 'Đang diễn ra'}
          </Badge>
        </div>

        <Card.Text className={`${styles.projectDescription} text-muted flex-grow-1`}>
          {project.description || 'Chưa có mô tả'}
        </Card.Text>

        <div className={styles.progressSection}>
          <div className="d-flex justify-content-between mb-1 small">
            <span>{formatCurrency(project.current_amount)} đ</span>
            <span className="text-muted">/ {formatCurrency(project.financial_goal)} đ</span>
          </div>
          <ProgressBar 
            now={progress} 
            variant={statusVariant}
            className={styles.progressBar}
          />
          <div className="text-end small text-muted mt-1">{progress}%</div>
        </div>

        {(project.start_date || project.end_date) && (
          <div className={`${styles.dateInfo} small text-muted mt-2`}>
            {project.start_date && <span>Bắt đầu: {formatDate(project.start_date)}</span>}
            {project.start_date && project.end_date && <span className="mx-1">•</span>}
            {project.end_date && <span>Kết thúc: {formatDate(project.end_date)}</span>}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function calculateProgress(current, goal) {
  if (!goal || goal === 0) return 0;
  const percentage = (current / goal) * 100;
  return Math.min(Math.round(percentage), 100);
}

export default ProjectList;
