import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

import styles from '../styles/LoginPage.module.css'; 

export function LoginPage() {
  const location = useLocation();
  const { login, isLoading, isError, errorMessage } = useLogin();

  const loginValidationSchema = {
    email: [validators.required, validators.email],
    password: [validators.required],
  };

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { email: '', password: '' },
    loginValidationSchema
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      login(values); 
    }
  };


  const renderError = (field) => (
    touched[field] && errors[field] ? (
      <Form.Control.Feedback type="invalid">
        {errors[field]}
      </Form.Control.Feedback>
    ) : null
  );

  return (
    <div className={styles.container}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className={styles.card}>
              <Card.Body className="p-4 p-md-5">
                

                <header className="text-center mb-4">
                  <h2 className="fw-bold mb-2">Welcome Back</h2>
                  <p className="text-muted">Login to your account to continue</p>
                </header>

                <div aria-live="polite">
                  {location.state?.verified && (
                    <Alert variant="success" className="mb-4">
                      Email verified successfully! Please login.
                    </Alert>
                  )}

                  {isError && errorMessage && (
                    <Alert variant="danger" className="mb-4" dismissible>
                      {errorMessage}
                    </Alert>
                  )}
                </div>

                <div className={`mb-4 ${isLoading ? styles.disabledWrapper : ''}`}>
                   <GoogleLoginButton />
                </div>

                <div className={styles.divider}>
                  <hr className={styles.dividerLine} />
                  <span className={styles.dividerText}>Or continue with email</span>
                </div>


                <Form onSubmit={handleSubmit} noValidate>
                  <fieldset disabled={isLoading}>
                    <Form.Group className="mb-3" controlId="login-email">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={values.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        isInvalid={touched.email && !!errors.email}
                        autoComplete="username" 
                      />
                      {renderError('email')}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="login-password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        value={values.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        isInvalid={touched.password && !!errors.password}
                        autoComplete="current-password"
                      />
                      {renderError('password')}
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check 
                        type="checkbox" 
                        id="remember-me"
                        label="Remember me" 
                      />
                      <Link to={ROUTES.FORGOT_PASSWORD} className="text-decoration-none small">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className={`w-100 ${styles.btnPrimary}`}
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Logging in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </fieldset>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to={ROUTES.REGISTER} className="fw-bold text-decoration-none text-dark">
                      Create an account
                    </Link>
                  </p>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}