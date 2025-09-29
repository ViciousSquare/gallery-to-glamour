import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-foreground">AI for Canadians.org</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#resources" className="text-foreground hover:text-primary transition-colors">
              Resources
            </a>
            <a href="#coaching" className="text-foreground hover:text-primary transition-colors">
              Coaching
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
          
          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <a href="#contact">Get Started</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;