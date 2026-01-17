import { Form, Row, Col } from 'react-bootstrap';
import styles from '../styles/CreateProjectPage.module.css';

export function ProjectDateForm({ values, errors, touched, handleChange, handleBlur }) {
  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <Form.Control.Feedback type="invalid">{errors[field]}</Form.Control.Feedback>
    ) : null;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>Campaign Timeline</h3>
      <p className={styles.sectionDescription}>
        Set the duration of your campaign to create urgency and transparency
      </p>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3 mb-md-0" controlId="project-start-date">
            <Form.Label className={styles.formLabel}>Start Date</Form.Label>
            <Form.Control
              type="date"
              className={styles.formInput}
              value={values.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              onBlur={() => handleBlur('startDate')}
              isInvalid={touched.startDate && !!errors.startDate}
              min={today}
            />
            {renderError('startDate')}
            <p className={styles.helpText}>When will your campaign begin?</p>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="project-end-date">
            <Form.Label className={styles.formLabel}>End Date</Form.Label>
            <Form.Control
              type="date"
              className={styles.formInput}
              value={values.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              onBlur={() => handleBlur('endDate')}
              isInvalid={touched.endDate && !!errors.endDate}
              min={values.startDate || today}
            />
            {renderError('endDate')}
            <p className={styles.helpText}>When should the campaign end?</p>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
}
