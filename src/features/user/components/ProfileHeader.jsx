import { LocationIcon, CheckIcon } from '@/shared/components/icons/ProfileIcons';
import styles from '../styles/ProfileHeader.module.css';

export function ProfileHeader({ user, onEditProfile, onChangePassword }) {
  return (
    <div className={styles.header}>
      <div className={styles.nameSection}>
        <h1 className={styles.name}>{user.fullName || 'No name'}</h1>
        {user.bio && <p className={styles.bio}>{user.bio}</p>}
        
        {user.location && (
          <div className={styles.location}>
            <LocationIcon size={14} />
            <span>{user.location}</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onEditProfile}>
          Edit Profile
        </button>
        {user.hasPassword && (
          <button className={styles.btnSecondary} onClick={onChangePassword}>
            Change Password
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;
