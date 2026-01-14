import { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { CloseIcon, LockIcon, GoogleIcon } from '@/shared/components/icons/ProfileIcons';
import styles from '../styles/ChangePasswordModal.module.css';

export function ChangePasswordModal({ show, onHide, onSubmit, isPending, hasPassword }) {
  const [values, setValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!values.newPassword || values.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      setError('Password confirmation does not match');
      return;
    }

    onSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  const handleClose = () => {
    setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    onHide();
  };

  if (!hasPassword) {
    return (
      <Modal show={show} onHide={handleClose} centered className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Account Security</h2>
          <button type="button" className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon size={20} />
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.googleInfo}>
            <GoogleIcon size={48} />
            <h3>Connected with Google</h3>
            <p>Your account is linked to Google. Password is managed through your Google account.</p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleClose} centered className={styles.modal}>
      <form onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <LockIcon size={20} />
            Change Password
          </h2>
          <button type="button" className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}

          <Form.Group className={styles.formGroup}>
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              value={values.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
            />
          </Form.Group>

          <Form.Group className={styles.formGroup}>
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={values.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              placeholder="Enter new password"
            />
          </Form.Group>

          <Form.Group className={styles.formGroup}>
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
            />
          </Form.Group>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={isPending}>
            {isPending ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangePasswordModal;
