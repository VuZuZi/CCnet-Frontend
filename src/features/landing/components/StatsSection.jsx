import { Container, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import styles from '../styles/Landing.module.css'

export function StatsSection({ stats }) {
  return (
    <section className={styles.statsSection}>
      <Container>
        <Row className="g-4">
          {stats.map((stat) => (
            <Col md={6} lg={3} key={stat.id}>
              <div className={styles.statsCard}>
                <div className={styles.statsNumber}>{stat.value}</div>
                <div className="text-muted">{stat.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

StatsSection.propTypes = {
  stats: PropTypes.array.isRequired
}