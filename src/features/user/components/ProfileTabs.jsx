import styles from '../styles/ProfileTabs.module.css';

const DEFAULT_TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'projects', label: 'Projects' },
];

export function ProfileTabs({ tabs = DEFAULT_TABS, activeTab, onTabChange }) {
  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProfileTabs;
