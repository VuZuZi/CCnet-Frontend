import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Button } from '@/shared/components/ui/Button/Button' // Dùng Button Shared xịn
import { ProgramCard } from './ProgramCard'
import styles from '../styles/Landing.module.css' // Import CSS Module

export function HeroSection({ programs }) {
  return (
    <section className={styles.heroSection}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="fade-in-up mb-5 mb-lg-0">
            <HeroContent />
          </Col>

          <Col lg={6}>
            <ProgramCardsGrid programs={programs} />
          </Col>
        </Row>
      </Container>
    </section>
  )
}

HeroSection.propTypes = {
  programs: PropTypes.array.isRequired
}

function HeroContent() {
  return (
    <>
      <h1 className={styles.heroTitle}>
        Grow Bold.<br />
        Move Free.<br />
        <span className={styles.heroAccent}>Play Hard.</span>
      </h1>
      
      <p className={styles.heroSubtitle}>
        A space where teams discover productivity through movement, collaboration, 
        and innovation.
      </p>

      <div className="d-flex gap-3 flex-wrap mb-4">
        <Link to="/register">
            <Button variant="yellow" size="lg">Start Free Trial</Button>
        </Link>
        <Link to="/demo">
            <Button variant="outlineDark" size="lg">Watch Demo</Button>
        </Link>
      </div>
    </>
  )
}

function ProgramCardsGrid({ programs }) {
  return (
    <Row className="g-3">
      {programs.map((program) => (
        <Col md={6} key={program.id}>
          <ProgramCard {...program} />
        </Col>
      ))}
    </Row>
  )
}