import PropTypes from 'prop-types'
import clsx from 'clsx'

// Map thẳng các variant class của CSS Module cũ sang Tailwind
const variants = {
  cardPurple: 'bg-gradient-to-br from-purple to-purple-dark text-white border-none',
  cardGreen: 'bg-gradient-to-br from-green to-green-dark text-black border-none',
  cardBlue: 'bg-gradient-to-br from-blue to-blue-dark text-white border-none',
  cardYellow: 'bg-gradient-to-br from-yellow-light to-yellow text-black border-none',
};

export function ProgramCard({ 
  ageRange, 
  title, 
  description, 
  emoji, 
  cardClass, 
  animationDelay 
}) {
  // Biến đổi string "card-purple" thành "cardPurple" để match với object variants
  const variantKey = cardClass.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  
  return (
    <div 
      className={clsx(
        // Base styles (thay thế cho .programCard)
        'bg-white border border-light-gray rounded-lg p-8 h-full flex flex-col relative',
        'transition-all duration-300 shadow-sm hover:-translate-y-2 hover:shadow-lg',
        'animate-float', // Đã được setup trong @theme ở Phase 1
        variants[variantKey]
      )}
      style={{ animationDelay }}
    >
      <span className="inline-block bg-white/25 backdrop-blur-sm py-1.5 px-4 rounded-[20px] text-sm font-semibold mb-4 self-start text-inherit">
        {ageRange}
      </span>
      <h3 className="font-bold mb-3 text-2xl">{title}</h3>
      <p className="mb-0 opacity-75 text-[0.95rem]">
        {description}
      </p>
      <div className="mt-4 text-6xl opacity-30">
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