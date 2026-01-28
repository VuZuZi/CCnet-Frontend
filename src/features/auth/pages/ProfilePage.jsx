/**
 * Profile Page
 */

import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useState } from 'react';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useToast } from '@/shared/contexts/ToastContext';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { validators } from '@/shared/constants/validation';

export function ProfilePage() {
  const user = useAuthStore(authSelectors.user);
  const { updateUser } = useAuthStore();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll, setValues } = 
    useFormValidation(
      { fullName: user.fullName, email: user.email },
      {
        fullName: [validators.required, validators.fullName],
        email: [validators.required, validators.email],
      }
    );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setValues({ fullName: user.fullName, email: user.email });
    setIsEditing(false);
  };

  const handleSave = () => {
    if (validateAll()) {
      // TODO: Call API to update profile
      updateUser({ fullName: values.fullName });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Header */}
            <div className="mb-4">
              <h1 className="fw-bold mb-2">My Profile</h1>
              <p className="text-muted">Manage your account information</p>
            </div>

            {/* Profile Card */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Personal Information</h5>
                  {!isEditing ? (
                    <Button variant="outline-primary" size="sm" onClick={handleEdit}>
                      ✏️ Edit
                    </Button>
                  ) : (
                    <div className="d-flex gap-2">
                      <Button variant="outline-secondary" size="sm" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button className="btn-yellow" size="sm" onClick={handleSave}>
                        💾 Save
                      </Button>
                    </div>
                  )}
                </div>

                <Form>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          onBlur={() => handleBlur('fullName')}
                          isInvalid={touched.fullName && !!errors.fullName}
                          disabled={!isEditing}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.fullName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          value={values.email}
                          disabled
                          readOnly
                        />
                        <Form.Text className="text-muted">
                          Email cannot be changed
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                          type="text"
                          value={user.role}
                          disabled
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>User ID</Form.Label>
                        <Form.Control
                          type="text"
                          value={user.userId}
                          disabled
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Security Card */}
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Security</h5>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Password</strong>
                      <p className="text-muted mb-0 small">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline-primary" size="sm">
                      Change Password
                    </Button>
                  </div>
                </div>

                <hr />

                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Two-Factor Authentication</strong>
                      <p className="text-muted mb-0 small">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline-success" size="sm">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}