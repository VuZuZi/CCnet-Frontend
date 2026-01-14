import styles from '../styles/ProfileStats.module.css';

export function ProfileStats({ stats }) {
  const defaultStats = {
    projectsJoined: stats?.projectsJoined ?? 0,
    projectsCreated: stats?.projectsCreated ?? 0,
    contributions: stats?.contributions ?? 0,
  };

  return (
    <div className={styles.stats}>
      <div className={styles.statItem}>
        <span className={styles.number}>{defaultStats.projectsJoined}</span>
        <span className={styles.label}>Projects Joined</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.number}>{defaultStats.projectsCreated}</span>
        <span className={styles.label}>Projects Created</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.number}>{defaultStats.contributions}</span>
        <span className={styles.label}>Contributions</span>
      </div>
    </div>
  );
}

export default ProfileStats;
