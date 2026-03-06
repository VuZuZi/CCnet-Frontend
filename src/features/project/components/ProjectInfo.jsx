import { Card } from 'react-bootstrap';
import { FiCalendar, FiTarget, FiMapPin, FiClock } from 'react-icons/fi';
import { formatCurrency, formatDate } from '@/shared/lib/formatters';
import styles from '../styles/ProjectDetailPage.module.css';

export function ProjectInfo({ project }) {
  const { description, financialGoal, startDate, endDate, createdAt } = project;

  return (
    <>
      {/* Description Card */}
      <Card className={styles.contentCard}>
        <Card.Body>
          <h3 className={styles.sectionTitle}>About this Campaign</h3>
          <p className={styles.description}>
            {description || 'No description has been provided for this campaign yet.'}
          </p>
        </Card.Body>
      </Card>

      {/* Details Card */}
      <Card className={styles.contentCard}>
        <Card.Body>
          <h3 className={styles.sectionTitle}>Campaign Details</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FiTarget size={20} />
              </div>
              <div className={styles.infoContent}>
                <div className={styles.infoLabel}>Financial Goal</div>
                <div className={styles.infoValue}>
                  {financialGoal > 0 ? formatCurrency(financialGoal) : 'Not set'}
                </div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FiCalendar size={20} />
              </div>
              <div className={styles.infoContent}>
                <div className={styles.infoLabel}>Start Date</div>
                <div className={styles.infoValue}>
                  {startDate ? formatDate(startDate) : 'Not set'}
                </div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FiClock size={20} />
              </div>
              <div className={styles.infoContent}>
                <div className={styles.infoLabel}>End Date</div>
                <div className={styles.infoValue}>
                  {endDate ? formatDate(endDate) : 'No deadline'}
                </div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FiMapPin size={20} />
              </div>
              <div className={styles.infoContent}>
                <div className={styles.infoLabel}>Created On</div>
                <div className={styles.infoValue}>
                  {createdAt ? formatDate(createdAt) : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
