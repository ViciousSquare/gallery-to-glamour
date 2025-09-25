import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin } from "lucide-react";
import patrickImage from "@/assets/patrick.jpeg";
import darcyImage from "@/assets/darcy.jpeg";
import ryanImage from "@/assets/ryan.jpeg";
import anshulaImage from "@/assets/anshula.jpeg";
import ashokImage from "@/assets/ashok.jpeg";

const CoachingSection = () => {
  const coaches = [
    {
      name: "Patrick Farrar",
      image: patrickImage,
      linkedin: "https://linkedin.com/in/patrickfarrar"
    },
    {
      name: "Darcy Norman", 
      image: darcyImage,
      linkedin: "https://linkedin.com/in/darcynorman"
    },
    {
      name: "Anshula Chowdhury",
      image: anshulaImage,
      linkedin: "https://linkedin.com/in/anshulachowdhury"
    },
    {
      name: "Ryan Oneil Knight",
      image: ryanImage,
      linkedin: "https://linkedin.com/in/ryanoneilknight"
    },
    {
      name: "Ashok Ranade",
      image: ashokImage,
      linkedin: "https://linkedin.com/in/ashokranade"
    }
  ];

  return (
    <section id="coaching" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-4">
            Personalized AI Navigation for Canadian Leaders
          </h2>
          <p className="text-xl text-blue-text max-w-3xl mx-auto mb-12">
            Get expert guidance tailored to your business needs. Our experienced navigators and coaches 
            understand the Canadian market and regulatory landscape.
          </p>
        </div>

        {/* Coaches Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-navy text-center mb-8">Our Expert Coaches</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {coaches.map((coach, index) => (
              <div key={index} className="text-center">
                <a 
                  href={coach.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-transparent group-hover:ring-primary transition-all">
                    <AvatarImage src={coach.image} alt={coach.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                      {coach.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="text-sm font-semibold text-navy group-hover:text-primary transition-colors">
                    {coach.name}
                  </h4>
                  <Linkedin className="w-4 h-4 mx-auto mt-2 text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            ))}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="text-2xl text-muted-foreground/50">+</span>
              </div>
              <h4 className="text-sm font-semibold text-muted-foreground">
                More to come
              </h4>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg"
          >
            <a href="mailto:patrick@aiforcanadians.org?subject=Start My AI Journey">
              Start Your AI Journey Today
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoachingSection;