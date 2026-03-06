import { Form } from 'react-bootstrap';
import styles from '../styles/CreateProjectPage.module.css';

export function ProjectBasicInfoForm({ values, errors, touched, handleChange, handleBlur }) {
  const titleMaxLength = 200;
  const descriptionMaxLength = 5000;

  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <Form.Control.Feedback type="invalid">{errors[field]}</Form.Control.Feedback>
    ) : null;

  const getCharCountClass = (current, max) => {
    const ratio = current / max;
    if (ratio >= 1) return styles.charCountError;
    if (ratio >= 0.9) return styles.charCountWarning;
    return '';
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>Basic Information</h3>
      <p className={styles.sectionDescription}>
        Give your campaign a clear title and description to attract supporters
      </p>

      <Form.Group className="mb-3" controlId="project-title">
        <Form.Label className={styles.formLabel}>
          Campaign Title <span className={styles.requiredMark}>*</span>
        </Form.Label>
        <Form.Control
          type="text"
          className={styles.formInput}
          placeholder="Enter a compelling title for your campaign"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          isInvalid={touched.title && !!errors.title}
          maxLength={titleMaxLength}
        />
        {renderError('title')}
        <div className={`${styles.charCount} ${getCharCountClass(values.title?.length || 0, titleMaxLength)}`}>
          {values.title?.length || 0}/{titleMaxLength}
        </div>
      </Form.Group>

      <Form.Group controlId="project-description">
        <Form.Label className={styles.formLabel}>Description</Form.Label>
        <Form.Control
          as="textarea"
          className={`${styles.formInput} ${styles.textarea}`}
          placeholder="Describe your campaign, its goals, and how the funds will be used..."
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          isInvalid={touched.description && !!errors.description}
          maxLength={descriptionMaxLength}
          rows={6}
        />
        {renderError('description')}
        <div className={`${styles.charCount} ${getCharCountClass(values.description?.length || 0, descriptionMaxLength)}`}>
          {values.description?.length || 0}/{descriptionMaxLength}
        </div>
        <p className={styles.helpText}>
          A detailed description helps potential donors understand your cause
        </p>
      </Form.Group>
    </div>
  );
}
