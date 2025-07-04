
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection";
import { VideoSection } from "@/components/landing/VideoSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { WaitlistSection } from "@/components/landing/WaitlistSection";
import { toast } from "sonner";
import { Footer } from "@/components/landing/Footer";
import { features, faqItems } from "@/components/landing/data";

const Index = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const heroRef = useRef<HTMLDivElement>(null);
  const dashboardPreviewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const handleAuthNavigation = () => {
    if (user) {
      navigate("/app");
    } else {
      navigate("/auth");
    }
  };

  const handleSignUpNavigation = () => {
    navigate("/auth?mode=signup");
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to Supabase when integration is set up
    toast.success("¡Te hemos añadido a la lista de espera!");
    setEmail("");
  };

  const scrollToSection = (id: string) => {
    switch (id) {
      case "empieza-gratis":
        heroRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "creador-cv":
        videoRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "match-de-ofertas":
        statsRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "caracteristicas-principales":
        featuresRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "planes-simples":
        pricingRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "preguntas-frecuentes":
        faqRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Header 
        onScrollToSection={scrollToSection} 
        onAuthNavigation={handleAuthNavigation} 
        onSignUpNavigation={handleSignUpNavigation} 
      />
      <main>
        <Hero ref={heroRef} onSignUpNavigation={handleSignUpNavigation} />
        <DashboardPreviewSection ref={dashboardPreviewRef} />
        <VideoSection ref={videoRef} onSignUpNavigation={handleSignUpNavigation} />
        <FeaturesSection ref={featuresRef} features={features} />
        <StatsSection ref={statsRef} />
        <PricingSection ref={pricingRef} onSignUpNavigation={handleSignUpNavigation} />
        <FAQSection ref={faqRef} faqItems={faqItems} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
