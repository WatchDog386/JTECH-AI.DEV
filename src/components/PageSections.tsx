// src/components/PageSections.tsx
import WhoItsForSection from "./sections/WhoItsForSection";
import HowItWorks from "./sections/HowItWorks";
import FeaturesSection from "./sections/FeaturesSection";
import PricingSection from "./sections/PricingSection";
import PaymentOptionsSection from "./sections/PaymentOptionsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FaqSection from "./sections/FaqSection";
import CTABanner from "./sections/CTABanner";

interface PageSectionsProps {
  tiers?: any[];
  tiersLoading?: boolean;
  tiersError?: string | null;
  navigate: (path: string) => void;
}

export const PageSections = ({ 
  tiers, 
  tiersLoading, 
  tiersError, 
  navigate 
}: PageSectionsProps) => {
  return (
    <>
      <WhoItsForSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection
        tiers={tiers}
        tiersLoading={tiersLoading}
        tiersError={tiersError}
        navigate={navigate}
      />
      <PaymentOptionsSection />
      <TestimonialsSection />
      <FaqSection />
      <CTABanner navigate={navigate} />
    </>
  );
};