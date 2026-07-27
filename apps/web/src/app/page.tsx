"use client";

import {
  CTASection,
  FeaturesSection,
  FooterSection,
  HeroSection,
  LandingNav,
  TechStackSection,
} from "@/components/landing";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth.store";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <LandingNav isAuthenticated={isAuthenticated} />

      {/* Hero */}
      <HeroSection isAuthenticated={isAuthenticated} />

      <Separator />

      {/* Features */}
      <FeaturesSection />

      <Separator />

      {/* Tech stack */}
      <TechStackSection />

      <Separator />

      {/* CTA */}
      <CTASection isAuthenticated={isAuthenticated} />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
