import { HeroSection } from '@/features/landing/components/HeroSection'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { StatsSection } from '@/features/landing/components/StatsSection'
import { UseCasesSection } from '@/features/landing/components/UseCasesSection'
import { CTASection } from '@/features/landing/components/CTASection'
import { LandingFooter } from '@/features/landing/components/LandingFooter'

import { 
  programs, 
  features, 
  stats, 
  useCases, 
  footerNavigation 
} from '@/features/landing/data/landing.data'

export function LandingPage() {
  return (
    <>
      <HeroSection programs={programs} />
      <FeaturesSection features={features} />
      <StatsSection stats={stats} />
      <UseCasesSection useCases={useCases} />
      <CTASection />
      <LandingFooter navigation={footerNavigation} />
    </>
  )
}