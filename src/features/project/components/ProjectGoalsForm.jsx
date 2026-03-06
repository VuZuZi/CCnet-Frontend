import { Form, InputGroup } from 'react-bootstrap';
import { FiDollarSign } from 'react-icons/fi';
import styles from '../styles/CreateProjectPage.module.css';

export function ProjectGoalsForm({ values, errors, touched, handleChange, handleBlur }) {
  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <Form.Control.Feedback type="invalid">{errors[field]}</Form.Control.Feedback>
    ) : null;

  const handleFinancialGoalChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      handleChange('financialGoal', value);
    }
  };

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>Campaign Goals</h3>
      <p className={styles.sectionDescription}>
        Set your fundraising target to let donors know what you're aiming for
      </p>

      <Form.Group controlId="project-financial-goal">
        <Form.Label className={styles.formLabel}>Financial Goal</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <FiDollarSign size={18} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            inputMode="decimal"
            className={styles.formInput}
            placeholder="0.00"
            value={values.financialGoal}
            onChange={handleFinancialGoalChange}
            onBlur={() => handleBlur('financialGoal')}
            isInvalid={touched.financialGoal && !!errors.financialGoal}
          />
          {renderError('financialGoal')}
        </InputGroup>
        <p className={styles.helpText}>
          Leave empty or enter 0 if you're not setting a financial goal
        </p>
      </Form.Group>
    </div>
  );
}
