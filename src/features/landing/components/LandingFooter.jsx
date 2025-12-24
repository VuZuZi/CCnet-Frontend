import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from '../styles/Landing.module.css'

export function LandingFooter({ navigation }) {
  return (
    <footer className={styles.footer}>
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <div className="d-flex align-items-center mb-3">
               <span className="fw-bold fs-4">CCNet</span>
            </div>
            <p className="text-muted">Modern management system for modern teams.</p>
          </Col>
          <Col md={8}>
            <Row>
              {Object.entries(navigation).map(([key, links]) => (
                <Col sm={4} key={key}>
                  <h6 className="fw-bold mb-3 text-capitalize">{key}</h6>
                  <ul className="list-unstyled">
                    {links.map((link) => (
                      <li className="mb-2" key={link.path}>
                        <Link to={link.path} className={styles.footerLink}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        
        <hr className="my-4" style={{ borderColor: 'var(--color-light-gray)' }} />
        
        <div className="text-center text-muted small">
          © {new Date().getFullYear()} CCNet. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}

LandingFooter.propTypes = {
  navigation: PropTypes.object.isRequired
}