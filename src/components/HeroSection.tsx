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
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
          >
            Start Your AI Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-muted-foreground text-muted-foreground hover:bg-muted px-8 py-3 text-lg"
          >
            Explore Resources
          </Button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-navy mb-2">500+ Canadians Trained</h3>
            <p className="text-blue-text">Successfully equipped with AI skills</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-navy mb-2">50+ Curated Resources</h3>
            <p className="text-blue-text">Programs and tools for your growth</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-navy mb-2">95% Success Rate</h3>
            <p className="text-blue-text">Businesses achieving AI integration</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;