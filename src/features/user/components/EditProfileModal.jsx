import { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { CloseIcon } from '@/shared/components/icons/ProfileIcons';
import styles from '../styles/EditProfileModal.module.css';

export function EditProfileModal({ show, onHide, user, onSave, isPending }) {
  const [values, setValues] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
  });
  const [newSkill, setNewSkill] = useState('');

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !values.skills.includes(skill)) {
      setValues((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setValues((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
      bio: values.bio.trim(),
      skills: values.skills,
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className={styles.modal}>
      <form onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Profile</h2>
          <button type="button" className={styles.closeBtn} onClick={onHide}>
            <CloseIcon size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Basic Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.grid}>
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={values.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Your full name"
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={values.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+84 xxx xxx xxx"
                />
              </Form.Group>

              <Form.Group className={styles.fullWidth}>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={values.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="City, Country"
                />
              </Form.Group>
            </div>
          </div>

          {/* Bio */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Bio</h3>
            <Form.Control
              as="textarea"
              rows={3}
              value={values.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Write something about yourself..."
              maxLength={500}
            />
            <div className={styles.charCount}>{values.bio.length}/500</div>
          </div>

          {/* Skills */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Skills</h3>
            <div className={styles.skillsContainer}>
              {values.skills.map((skill, index) => (
                <span key={index} className={styles.skillTag}>
                  {skill}
                  <button
                    type="button"
                    className={styles.removeSkill}
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className={styles.addSkillRow}>
              <Form.Control
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill..."
              />
              <button type="button" className={styles.addBtn} onClick={handleAddSkill}>
                Add
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onHide}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfileModal;
