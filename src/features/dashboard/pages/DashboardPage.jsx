/**
 * Dashboard Page
 */

import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function DashboardPage() {
  const user = useAuthStore(authSelectors.user);

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold mb-2">Welcome back, {user.fullName}! 👋</h1>
            <p className="text-muted">Here's what's happening with your account today.</p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Projects"
              value="12"
              icon="📁"
              color="purple"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Active Tasks"
              value="24"
              icon="✅"
              color="green"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Team Members"
              value="8"
              icon="👥"
              color="blue"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Completed"
              value="156"
              icon="🎯"
              color="yellow"
            />
          </Col>
        </Row>

        {/* User Info Card */}
        <Row>
          <Col lg={6}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Account Information</h5>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Email</small>
                  <strong>{user.email}</strong>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Role</small>
                  <span className="badge bg-primary">{user.role}</span>
                </div>
                <div>
                  <small className="text-muted d-block mb-1">User ID</small>
                  <code className="text-muted">{user.userId}</code>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

/**
 * Stats Card Component
 */
function StatsCard({ title, value, icon, color }) {
  const colorMap = {
    purple: 'var(--color-purple)',
    green: 'var(--color-green)',
    blue: 'var(--color-blue)',
    yellow: 'var(--color-yellow)',
  };

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="text-muted mb-1 small">{title}</p>
            <h3 className="fw-bold mb-0">{value}</h3>
          </div>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '48px',
              height: '48px',
              background: colorMap[color],
              fontSize: '1.5rem',
            }}
          >
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}