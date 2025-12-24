import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useLocation, Navigate } from 'react-router-dom';
import { useVerifyOTP } from '../hooks/useVerifyOTP';
import { useResendOTP } from '../hooks/useResendOTP';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { useCountdown } from '@/shared/hooks/useCountdown';
import { validators } from '@/shared/constants/validation';
import { ROUTES } from '@/shared/constants/routes';

export function VerifyOTPPage() {
  const location = useLocation();
  const userId = location.state?.userId;
  const email = location.state?.email;

  const { verifyOTP, isLoading, isError, errorMessage } = useVerifyOTP();
  const { resendOTP, isLoading: isResending } = useResendOTP();

  const { seconds: countdown, startCountdown, isRunning } = useCountdown(0);
  const canResend = !isRunning;

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { otp: '' },
    {
      otp: [validators.required, validators.otp],
    }
  );

  if (!userId) {
    return <Navigate to={ROUTES.REGISTER} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateAll()) {
      verifyOTP({
        userId,
        otp: values.otp,
      });
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;
    try {
        await resendOTP(email);
        startCountdown(60); 
    } catch (error) {
        console.error('Resend OTP failed:', error);
    }
};

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span
                      style={{ fontSize: '3rem' }}
                      role="img"
                      aria-label="email"
                    >
                      📧
                    </span>
                  </div>
                  <h2 className="fw-bold mb-2">Verify Your Email</h2>
                  <p className="text-muted">
                    We've sent a 6-digit code to <strong>{email || 'your email'}</strong>
                  </p>
                </div>

                {isError && errorMessage && (
                  <Alert variant="danger" className="mb-4" dismissible>
                    <Alert.Heading className="h6 mb-2">Verification Failed</Alert.Heading>
                    {errorMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Verification Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={values.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        handleChange('otp', value);
                      }}
                      onBlur={() => handleBlur('otp')}
                      isInvalid={touched.otp && !!errors.otp}
                      disabled={isLoading}
                      maxLength={6}
                      style={{
                        fontSize: '1.5rem',
                        letterSpacing: '0.5rem',
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.otp}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 btn-yellow"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Didn't receive the code?{' '}
                    <button
                      className="btn btn-link p-0 text-decoration-none fw-bold"
                      onClick={handleResend}
                      disabled={!canResend || isResending}
                      style={{
                        cursor: canResend && !isResending ? 'pointer' : 'not-allowed',
                        opacity: canResend && !isResending ? 1 : 0.6
                      }}
                    >
                      {isResending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" />
                          Sending...
                        </>
                      ) : countdown > 0 ? (
                        `Resend in ${countdown}s`
                      ) : (
                        'Resend Code'
                      )}
                    </button>
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