import { Navbar as BSNavbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/Button/Button'; 
import styles from './Navbar.module.css';

export function Navbar() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const user = useAuthStore(authSelectors.user);
  const { logout } = useLogout();

  return (
    <BSNavbar className={styles.navbar} sticky="top" expand="lg">
      <Container>
        <BSNavbar.Brand as={Link} to={ROUTES.HOME} className="d-flex align-items-center">
          <div className={styles.logoBox}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="10" height="10" fill="currentColor"/>
              <rect y="14" width="10" height="10" fill="currentColor"/>
              <rect x="14" width="10" height="10" fill="currentColor"/>
              <rect x="14" y="14" width="10" height="10" fill="currentColor"/>
            </svg>
          </div>
          <span className={styles.brandName}>CCNet</span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center gap-lg-4 gap-2 mt-3 mt-lg-0">
            {['Features', 'Pricing', 'About'].map((item) => (
              <Nav.Link 
                key={item}
                as={Link} 
                to={ROUTES[item.toUpperCase()]} 
                className={styles.navLink}
              >
                {item}
              </Nav.Link>
            ))}

            {/* Auth Section */}
            <div className="ms-lg-2">
              {isAuthenticated ? (
                <AuthenticatedNav user={user} onLogout={logout} />
              ) : (
                <UnauthenticatedNav />
              )}
            </div>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

function AuthenticatedNav({ user, onLogout }) {
  const getInitials = (name) => name?.substring(0, 2).toUpperCase() || 'U';

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        id="user-dropdown" 
        className={`${styles.userToggle} d-flex align-items-center gap-2`}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.fullName} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {getInitials(user.fullName)}
          </div>
        )}
        <span className="d-none d-md-inline small fw-semibold">{user.fullName}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-sm border-0 mt-2">
        <Dropdown.Item as={Link} to={ROUTES.PROFILE}>👤 Profile</Dropdown.Item>
        <Dropdown.Item as={Link} to={ROUTES.DASHBOARD}>📊 Dashboard</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={onLogout} className="text-danger">🚪 Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function UnauthenticatedNav() {
  return (
    <div className="d-flex align-items-center gap-2">
      <Link to={ROUTES.LOGIN}>
        <Button variant="outlineDark" className="px-3 py-2">Login</Button>
      </Link>
      
      <Link to={ROUTES.REGISTER}>
        <Button variant="yellow" className="px-3 py-2">Get Started</Button>
      </Link>
    </div>
  );
}