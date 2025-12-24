import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button/Button'
import styles from '../styles/Landing.module.css'

export function CTASection() {
  return (
    <Container>
      <section className={styles.ctaSection}>
        <Row className="align-items-center justify-content-center">
          <Col lg={8} className="mb-4 mb-lg-0">
            <h2 className="display-5 fw-bold mb-3">Ready to Get Started?</h2>
            <p className="fs-5 opacity-75 mb-4">
              Join thousands of teams already using our platform.
            </p>
            <Link to="/register">
              <Button variant="yellow" size="lg">Start Free Trial</Button>
            </Link>
          </Col>
        </Row>
      </section>
    </Container>
  )
}