import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ResourcesSection from "@/components/ResourcesSection";
import CoachingSection from "@/components/CoachingSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ResourcesSection />
      <CoachingSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
