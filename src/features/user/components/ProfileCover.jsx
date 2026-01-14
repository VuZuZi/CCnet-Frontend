import { CameraIcon } from '@/shared/components/icons/ProfileIcons';
import styles from '../styles/ProfileCover.module.css';

export function ProfileCover({ user, initials }) {
  return (
    <div className={styles.coverWrapper}>
      {/* Cover Image */}
      <div className={styles.cover}>
        <div className={styles.coverOverlay} />
        <button className={styles.editCoverBtn} title="Edit cover photo">
          <CameraIcon size={16} />
          <span>Edit cover</span>
        </button>
      </div>

      {/* Avatar */}
      <div className={styles.avatarContainer}>
        <div className={styles.avatarWrapper}>
          {user.avatar && !user.avatar.includes('gravatar') ? (
            <img src={user.avatar} alt={user.fullName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarInitials}>{initials}</div>
          )}
          <button className={styles.editAvatarBtn} title="Edit profile picture">
            <CameraIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCover;
