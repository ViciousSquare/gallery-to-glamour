import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto text-center max-w-6xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
          <span className="text-primary">Empowering Canadians</span>{" "}
          <span className="text-navy">with AI Excellence</span>
        </h1>
        
        <p className="text-xl text-blue-text max-w-4xl mx-auto mb-12 leading-relaxed">
          Discover curated AI resources, programs, and personalized coaching 
          specifically designed for Canadian employees and businesses. 
          Navigate the AI landscape with expert guidance.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            asChild
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
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
            className="border-muted-foreground text-muted-foreground hover:bg-muted px-8 py-3 text-lg"
          >
            <a href="#resources">Explore Resources</a>
          </Button>
        </div>
        
      </div>
    </section>
  );
};

export default HeroSection;