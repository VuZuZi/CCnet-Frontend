import { StarIcon } from '@/shared/components/icons/ProfileIcons';
import styles from '../styles/ProfileSkills.module.css';

export function ProfileSkills({ skills = [] }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <StarIcon size={18} />
        Skills
      </h3>
      
      {skills.length > 0 ? (
        <div className={styles.skillsList}>
          {skills.map((skill, index) => (
            <span key={index} className={styles.skill}>{skill}</span>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No skills added yet</p>
      )}
    </div>
  );
}

export default ProfileSkills;
