import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Check, Calendar, Linkedin } from "lucide-react";
import patrickImage from "@/assets/patrick.jpeg";
import darcyImage from "@/assets/darcy.jpeg";
import ryanImage from "@/assets/ryan.jpeg";
import anshulaImage from "@/assets/anshula.jpeg";
import ashokImage from "@/assets/ashok.jpeg";

const CoachingSection = () => {
  const services = [
    {
      title: "AI Strategy Consultation",
      description: "Develop a comprehensive AI adoption strategy tailored to your Canadian business needs and regulatory requirements.",
      duration: "2 hours",
      pricing: "On Request",
      features: [
        "Custom AI roadmap",
        "Competitive analysis", 
        "ROI projections",
        "Implementation timeline"
      ],
      icon: <Calendar className="h-5 w-5" />
    },
    {
      title: "Team AI Training",
      description: "Hands-on workshops to upskill your team on AI tools and best practices for your specific industry.",
      duration: "Half or full day",
      pricing: "On Request", 
      features: [
        "Customized curriculum",
        "Practical exercises",
        "Industry-specific examples",
        "Follow-up support"
      ],
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: "Ongoing AI Mentorship",
      description: "Monthly guidance sessions to support your AI journey with expert advice and troubleshooting.",
      duration: "Monthly sessions",
      pricing: "On Request",
      features: [
        "Monthly 1-on-1 calls",
        "Email support",
        "Resource recommendations", 
        "Progress tracking"
      ],
      icon: <Check className="h-5 w-5" />
    }
  ];

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
            Personalized AI Coaching for Canadian Leaders
          </h2>
          <p className="text-xl text-blue-text max-w-3xl mx-auto mb-12">
            Get expert guidance tailored to your business needs. Our experienced coaches 
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

        {/* Services */}
        <div className="space-y-8">
          <h3 className="text-3xl font-bold text-navy text-center">Some of the services we offer</h3>
          <div className="space-y-6">
            {services.map((service, index) => (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-navy">{service.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-blue-text mt-1">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration}
                          </span>
                          <span className="font-medium">{service.pricing}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoachingSection;