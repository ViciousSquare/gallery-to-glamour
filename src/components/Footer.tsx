import { MapPin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy text-navy-foreground py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold">AI for Canadians</span>
            </div>
            <p className="text-navy-foreground/80 leading-relaxed">
              Empowering Canadian businesses with AI education, resources, and personalized coaching to 
              navigate the future of technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-navy-foreground/60 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" className="text-navy-foreground/60 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#resources" className="text-navy-foreground/80 hover:text-primary transition-colors">
                  Resources
                </a>
              </li>
              <li>
                <a href="#coaching" className="text-navy-foreground/80 hover:text-primary transition-colors">
                  Coaching Services
                </a>
              </li>
              <li>
                <a href="#about" className="text-navy-foreground/80 hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-navy-foreground/80 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-navy-foreground/80 hover:text-primary transition-colors">
                  AI Strategy Consultation
                </a>
              </li>
              <li>
                <a href="#" className="text-navy-foreground/80 hover:text-primary transition-colors">
                  Team AI Training
                </a>
              </li>
              <li>
                <a href="#" className="text-navy-foreground/80 hover:text-primary transition-colors">
                  Ongoing Mentorship
                </a>
              </li>
              <li>
                <a href="#" className="text-navy-foreground/80 hover:text-primary transition-colors">
                  Resource Curation
                </a>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-navy-foreground/80">patrick@aiforcanadians.org</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-navy-foreground/80">
                    Serving all of Canada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-navy-foreground/60 text-sm">
            © 2024 AI for Canadians.org. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-navy-foreground/60 hover:text-primary text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-navy-foreground/60 hover:text-primary text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;