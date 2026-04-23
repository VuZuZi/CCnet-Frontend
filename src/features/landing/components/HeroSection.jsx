import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Button } from '@/shared/components/ui/Button/Button'
import { ProgramCard } from './ProgramCard'

export function HeroSection({ programs }) {
  return (
    <section className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-off-white to-white flex items-center py-16 relative">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up mb-12 lg:mb-0">
            <HeroContent />
          </div>

          <div>
            <ProgramCardsGrid programs={programs} />
          </div>

        </div>
      </div>
    </section>
  )
}

HeroSection.propTypes = {
  programs: PropTypes.array.isRequired
}

function HeroContent() {
  return (
    <>
      <h1 className="text-[clamp(3rem,6vw,5rem)] font-extrabold leading-[1.1] mb-6 text-black">
        Phát triển táo bạo.<br />
        Tự do di chuyển.<br />
        <span className="text-orange">Chơi hết mình.</span>
      </h1>
      
      <p className="text-[clamp(1.1rem,2vw,1.5rem)] text-gray mb-10 leading-relaxed max-w-[600px]">
        Một không gian nơi các nhóm khám phá năng suất thông qua chuyển động, 
        hợp tác và cải tiến.
      </p>

      <div className="flex gap-3 flex-wrap mb-8">
        <Link to="/register">
            <Button variant="yellow" className="!px-8 !py-4 !text-lg">Bắt đầu dùng thử miễn phí</Button>
        </Link>
        <Link to="/demo">
            <Button variant="outlineDark" className="!px-8 !py-4 !text-lg">Xem bản trải nghiệm</Button>
        </Link>
      </div>
    </>
  )
}

function ProgramCardsGrid({ programs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {programs.map((program) => (
        <div key={program.id}>
          <ProgramCard {...program} />
        </div>
      ))}
    </div>
  )
}
