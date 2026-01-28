import { EmailIcon, PhoneIcon, LocationIcon, CheckIcon } from '@/shared/components/icons/ProfileIcons';
import styles from '../styles/ProfileAbout.module.css';

export function ProfileAbout({ user }) {
  const infoItems = [
    { icon: EmailIcon, label: 'Email', value: user.email, verified: user.isEmailVerified },
    { icon: PhoneIcon, label: 'Phone', value: user.phone },
    { icon: LocationIcon, label: 'Location', value: user.location },
  ].filter(item => item.value);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>About</h3>
      
      {user.bio && (
        <p className={styles.bio}>{user.bio}</p>
      )}

      <div className={styles.infoList}>
        {infoItems.map(({ icon: Icon, label, value, verified }) => (
          <div key={label} className={styles.infoItem}>
            <Icon size={18} className={styles.icon} />
            <div className={styles.infoContent}>
              <span className={styles.value}>
                {value}
                {verified && (
                  <span className={styles.verifiedBadge}>
                    <CheckIcon size={12} /> Verified
                  </span>
                )}
              </span>
              <span className={styles.label}>{label}</span>
            </div>
          </div>
        ))}

        {infoItems.length === 0 && !user.bio && (
          <p className={styles.empty}>No information added yet</p>
        )}
      </div>
    </div>
  );
}

export default ProfileAbout;
