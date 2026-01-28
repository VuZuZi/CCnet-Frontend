import { useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import { CameraIcon } from '@/shared/components/icons/ProfileIcons';
import { useChangeAvatar } from '../hooks/useChangeAvatar'; 
import { useToast } from '@/shared/contexts/ToastContext';
import styles from '../styles/ProfileCover.module.css';

export function ProfileCover({ user, initials }) {
  const fileInputRef = useRef(null);
  const { changeAvatar, isPending } = useChangeAvatar();
  const toast = useToast();

  const handleEditAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!VALID_TYPES.includes(file.type)) {
      toast.error('Only image files (JPEG, PNG, WEBP) are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    changeAvatar(file);
    
    event.target.value = '';
  };

  return (
    <div className={styles.coverWrapper}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        style={{ display: 'none' }}
      />

      <div className={styles.cover}>
        <div className={styles.coverOverlay} />
        <button className={styles.editCoverBtn} title="Edit cover photo">
          <CameraIcon size={16} />
          <span>Edit cover</span>
        </button>
      </div>

      <div className={styles.avatarContainer}>
        <div className={styles.avatarWrapper}>
          {isPending && (
            <div className={styles.loadingOverlay}>
              <Spinner animation="border" size="sm" variant="light" />
            </div>
          )}

          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.fullName} 
              className={styles.avatar} 
              style={{ opacity: isPending ? 0.7 : 1 }}
            />
          ) : (
            <div className={styles.avatarInitials}>{initials}</div>
          )}
          
          <button 
            className={styles.editAvatarBtn} 
            title="Change profile picture"
            onClick={handleEditAvatarClick}
            disabled={isPending}
          >
            <CameraIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCover;