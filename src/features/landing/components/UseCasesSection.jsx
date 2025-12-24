import { Container, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import styles from '../styles/Landing.module.css'

const COLOR_MAP = {
  purple: 'var(--color-purple)',
  green: 'var(--color-green)',
  blue: 'var(--color-blue)',
  yellow: 'var(--color-yellow)'
}

export function UseCasesSection({ useCases }) {
  return (
    <section className={styles.useCasesSection}>
      <Container>
        <Row className="text-center mb-5">
          <Col>
            <h2 className="display-5 fw-bold mb-3">Built for Every Team</h2>
            <p className="text-muted fs-5">From startups to enterprises, we've got you covered</p>
          </Col>
        </Row>

        <Row className="g-4">
          {useCases.map((useCase) => (
            <Col md={6} lg={3} key={useCase.id}>
              <UseCaseCard {...useCase} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

UseCasesSection.propTypes = {
  useCases: PropTypes.array.isRequired
}

function UseCaseCard({ icon: Icon, title, description, color }) {
  const accentColor = COLOR_MAP[color]
  
  return (
    <div 
      className={styles.useCaseCard}
      style={{ borderColor: accentColor }} 
    >
      <div 
        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
        style={{ 
          width: '64px', height: '64px', 
          background: accentColor, 
          borderRadius: '16px' 
        }}
      >
        <Icon size={32} color={color === 'yellow' || color === 'green' ? 'black' : 'white'} />
      </div>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="text-muted small mb-0">{description}</p>
    </div>
  )
}