import { Container, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import styles from '../styles/Landing.module.css'

export function FeaturesSection({ features }) {
  return (
    <section className={styles.featuresSection}>
      <Container>
        <Row className="text-center mb-5">
          <Col>
            <h2 className="display-5 fw-bold mb-3">
              Everything You Need to <span className="text-orange">Succeed</span>
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '1.125rem' }}>
              Powerful features designed to help your team collaborate better.
            </p>
          </Col>
        </Row>
        
        <Row className="g-4">
          {features.map((feature) => (
            <Col md={6} lg={4} key={feature.id}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <feature.icon />
                </div>
                <h4 className="fw-bold mb-3">{feature.title}</h4>
                <p className="text-muted mb-0">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

FeaturesSection.propTypes = {
  features: PropTypes.array.isRequired
}