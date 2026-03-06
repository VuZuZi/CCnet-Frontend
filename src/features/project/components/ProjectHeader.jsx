import { Card, ProgressBar } from 'react-bootstrap';
import { FiCalendar, FiTarget, FiUsers, FiClock } from 'react-icons/fi';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';
import styles from '../styles/ProjectDetailPage.module.css';

export function ProjectHeader({ project }) {
  const {
    title,
    status,
    financialGoal,
    currentAmount,
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
    <Card className={styles.headerCard}>
      <div className={styles.headerCover} />
      
      <div className={styles.headerContent}>
        <div className={styles.headerMeta}>
          <div>
            <h1 className={styles.projectTitle}>{title}</h1>
            <div className={styles.projectCreator}>
              <FiUsers size={16} />
              <span>Campaign</span>
            </div>
          </div>
          <span className={`${styles.statusBadge} ${getStatusClass()}`}>
            {status}
          </span>
        </div>
      </div>

      {financialGoal > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>
              {formatCurrency(currentAmount)} raised
            </span>
            <span className={styles.progressValue}>
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <ProgressBar 
            now={progressPercent} 
            className={styles.progressBar}
            variant="success"
          />
        </div>
      )}

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <FiTarget size={20} />
          <div>
            <div className={styles.statValue}>{formatCurrency(financialGoal)}</div>
            <div className={styles.statLabel}>Goal</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <FiCalendar size={20} />
          <div>
            <div className={styles.statValue}>
              {startDate ? formatDate(startDate) : 'Not set'}
            </div>
            <div className={styles.statLabel}>Start Date</div>
          </div>
        </div>

        <div className={styles.statItem}>
          <FiClock size={20} />
          <div>
            <div className={styles.statValue}>
              {daysRemaining !== null ? `${daysRemaining} days` : 'No deadline'}
            </div>
            <div className={styles.statLabel}>Remaining</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
