import PropTypes from 'prop-types'
import clsx from 'clsx'
import styles from '../styles/Landing.module.css'

export function ProgramCard({ 
  ageRange, 
  title, 
  description, 
  emoji, 
  cardClass, 
  animationDelay 
}) {
  const variantKey = cardClass.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  
  return (
    <div 
      className={clsx(
        styles.programCard, 
        styles[variantKey], 
        'float-animation' 
      )}
      style={{ animationDelay }}
    >
      <span className={styles.programTag}>{ageRange}</span>
      <h3 className="fw-bold mb-3">{title}</h3>
      <p className="mb-0 opacity-75" style={{ fontSize: '0.95rem' }}>
        {description}
      </p>
      <div className="mt-4" style={{ fontSize: '4rem', opacity: 0.3 }}>
        {emoji}
      </div>
    </div>
  )
}

ProgramCard.propTypes = {
  ageRange: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  emoji: PropTypes.string.isRequired,
  cardClass: PropTypes.string.isRequired,
  animationDelay: PropTypes.string.isRequired
}