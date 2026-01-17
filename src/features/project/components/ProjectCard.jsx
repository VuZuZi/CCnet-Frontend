import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { FiCalendar, FiUsers, FiTarget } from 'react-icons/fi';
import { ROUTES } from '@/shared/constants/routes';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';
import styles from '../styles/ProjectCard.module.css';

export function ProjectCard({ project }) {
  const {
    projectId,
    title,
    description,
    financialGoal,
    currentAmount,
    status,
    startDate,
    endDate,
  } = project;

  const progressPercent = financialGoal > 0 
    ? Math.min((currentAmount / financialGoal) * 100, 100) 
    : 0;

  const getStatusClass = () => {
    const statusClasses = {
      active: styles.statusActive,
      pending: styles.statusPending,
      draft: styles.statusDraft,
      completed: styles.statusCompleted,
      cancelled: styles.statusCancelled,
    };
    return statusClasses[status] || styles.statusDraft;
  };

  const getDaysRemaining = () => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Link to={`${ROUTES.PROJECTS}/${projectId}`} className={styles.cardLink}>
      <Card className={styles.card}>
        <div className={styles.cardImage}>
          <div className={styles.cardImagePlaceholder}>
            <FiTarget size={32} />
          </div>
          <span className={`${styles.statusBadge} ${getStatusClass()}`}>
            {status}
          </span>
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>
            {description || 'No description provided'}
          </p>

          {financialGoal > 0 && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressRaised}>
                  {formatCurrency(currentAmount)}
                </span>
                <span className={styles.progressGoal}>
                  of {formatCurrency(financialGoal)}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className={styles.statsRow}>
            {startDate && (
              <div className={styles.statItem}>
                <FiCalendar size={14} />
                <span>{formatDate(startDate)}</span>
              </div>
            )}
            {daysRemaining !== null && status === 'active' && (
              <div className={styles.statItem}>
                <FiUsers size={14} />
                <span>{daysRemaining} days left</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
