import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiFileText } from 'react-icons/fi';
import { useCreateProject } from '../hooks/useCreateProject';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { ProjectBasicInfoForm } from '../components/ProjectBasicInfoForm';
import { ProjectGoalsForm } from '../components/ProjectGoalsForm';
import { ProjectDateForm } from '../components/ProjectDateForm';
import styles from '../styles/CreateProjectPage.module.css';

const initialValues = {
  title: '',
  description: '',
  financialGoal: '',
  startDate: '',
  endDate: '',
};

const validationSchema = {
  title: [validators.projectTitle],
  description: [validators.projectDescription],
  financialGoal: [validators.financialGoal],
  endDate: [validators.endDateAfterStart],
};

export function CreateProjectPage() {
  const navigate = useNavigate();
  const { createProject, isLoading, isError, errorMessage } = useCreateProject();
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    handleBlur, 
    validateAll 
  } = useFormValidation(initialValues, validationSchema);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateAll()) {
      const projectData = {
        title: values.title.trim(),
        description: values.description?.trim() || '',
        financialGoal: values.financialGoal ? parseFloat(values.financialGoal) : 0,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        status: saveAsDraft ? 'draft' : 'pending',
      };
      
      createProject(projectData);
    }
  };

  const handleSaveDraft = () => {
    setSaveAsDraft(true);
    setTimeout(() => {
      document.getElementById('create-project-form')?.requestSubmit();
    }, 0);
  };

  const handlePublish = () => {
    setSaveAsDraft(false);
  };

  return (
    <div className={styles.pageContainer}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Back Link */}
            <Link to={ROUTES.PROJECTS} className="text-decoration-none d-inline-flex align-items-center gap-2 mb-4 text-muted">
              <FiArrowLeft size={18} />
              <span>Back to Campaigns</span>
            </Link>

            {/* Page Header */}
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Create New Campaign</h1>
              <p className={styles.pageSubtitle}>
                Start a fundraising campaign to support your cause and make a difference
              </p>
            </div>

            {/* Error Alert */}
            {isError && errorMessage && (
              <Alert variant="danger" className="mb-4" dismissible>
                {errorMessage}
              </Alert>
            )}

            {/* Form Card */}
            <Card className={styles.formCard}>
              <Form id="create-project-form" onSubmit={handleSubmit} noValidate>
                <fieldset disabled={isLoading}>
                  {/* Basic Info Section */}
                  <ProjectBasicInfoForm
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  {/* Goals Section */}
                  <ProjectGoalsForm
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  {/* Date Section */}
                  <ProjectDateForm
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />

                  {/* Form Footer */}
                  <div className={styles.formFooter}>
                    <div className={styles.footerLeft}>
                      <Button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => navigate(ROUTES.PROJECTS)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={handleSaveDraft}
                        disabled={isLoading}
                      >
                        <FiFileText size={16} className="me-2" />
                        Save as Draft
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      className={styles.btnPrimary}
                      disabled={isLoading}
                      onClick={handlePublish}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FiSave size={16} className="me-2" />
                          Create Campaign
                        </>
                      )}
                    </Button>
                  </div>
                </fieldset>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
