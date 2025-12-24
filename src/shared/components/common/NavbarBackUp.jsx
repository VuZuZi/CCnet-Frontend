/**
 * Navbar Component with Authentication
 */

import { Navbar as BSNavbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { ROUTES } from '@/shared/constants/routes';

export function Navbar() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();

  return (
    <BSNavbar className="navbar-modern" sticky="top">
      <Container>
        {/* Logo */}
        <BSNavbar.Brand as={Link} to={ROUTES.HOME} className="d-flex align-items-center">
          <div 
            className="bg-yellow rounded-3 d-flex align-items-center justify-content-center me-2"
            style={{ width: '44px', height: '44px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="10" height="10" fill="currentColor"/>
              <rect y="14" width="10" height="10" fill="currentColor"/>
              <rect x="14" width="10" height="10" fill="currentColor"/>
              <rect x="14" y="14" width="10" height="10" fill="currentColor"/>
            </svg>
          </div>
          <span className="fw-bold fs-5" style={{ color: 'var(--color-black)' }}>
            CCNet
          </span>
        </BSNavbar.Brand>

        {/* Navigation Links */}
        <Nav className="ms-auto d-flex align-items-center gap-4">
          <Nav.Link as={Link} to={ROUTES.FEATURES} className="nav-link">
            Features
          </Nav.Link>
          <Nav.Link as={Link} to={ROUTES.PRICING} className="nav-link">
            Pricing
          </Nav.Link>
          <Nav.Link as={Link} to={ROUTES.ABOUT} className="nav-link">
            About
          </Nav.Link>

          {/* Auth Section */}
          {isAuthenticated ? (
            <AuthenticatedNav user={user} onLogout={logout} />
          ) : (
            <UnauthenticatedNav />
          )}
        </Nav>
      </Container>
    </BSNavbar>
  );
}

/**
 * Nav for authenticated users
 */
function AuthenticatedNav({ user, onLogout }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="light"
        id="user-dropdown"
        className="d-flex align-items-center gap-2 border-0"
        style={{ background: 'var(--color-light-gray)' }}
      >
        {/* User Avatar or Initials */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className="rounded-circle"
            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
          />
        ) : (
          <div 
            className="bg-yellow rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', fontSize: '0.875rem', fontWeight: 'bold' }}
          >
            {getInitials(user.fullName)}
          </div>
        )}
        <span className="d-none d-md-inline">{user.fullName}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item as={Link} to={ROUTES.PROFILE}>
          👤 Profile
        </Dropdown.Item>
        <Dropdown.Item as={Link} to={ROUTES.DASHBOARD}>
          📊 Dashboard
        </Dropdown.Item>
        <Dropdown.Item as={Link} to={ROUTES.SETTINGS}>
          ⚙️ Settings
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={onLogout} className="text-danger">
          🚪 Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

/**
 * Nav for unauthenticated users
 */
function UnauthenticatedNav() {
  return (
    <div className="d-flex align-items-center gap-2">
      <Button
        as={Link}
        to={ROUTES.LOGIN}
        variant="outline-dark"
        size="sm"
      >
        Login
      </Button>
      <Button
        as={Link}
        to={ROUTES.REGISTER}
        className="btn-yellow"
        size="sm"
      >
        Get Started
      </Button>
    </div>
  );
}