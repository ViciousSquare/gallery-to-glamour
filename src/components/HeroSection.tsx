import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 min-h-[600px]">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-navy/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto text-center max-w-6xl relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-primary block mb-2 animate-fade-in">Empowering Canadians</span>
          <span className="text-navy block">with AI Excellence</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-blue-text max-w-4xl mx-auto mb-12 leading-relaxed font-light">
          Discover curated AI resources, programs, and personalized coaching 
          specifically designed for Canadian employees and businesses. 
          Navigate the AI landscape with expert guidance.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            asChild
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <a href="#contact">
              Start Your AI Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            size="lg"
            className="border-2 border-navy/20 text-navy hover:bg-navy/5 px-10 py-6 text-lg hover:border-navy/40 transition-all"
          >
            <a href="#resources">Explore Resources</a>
          </Button>
        </div>
        
        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-12 border-t border-border/50">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">500+</div>
            <div className="text-sm text-muted-foreground">Canadians Trained</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">50+</div>
            <div className="text-sm text-muted-foreground">Curated Resources</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;