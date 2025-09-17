import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Check, Calendar } from "lucide-react";

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

  return (
    <section id="coaching" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-4">
            Personalized AI Coaching for Canadian Leaders
          </h2>
          <p className="text-xl text-blue-text max-w-3xl mx-auto">
            Get expert guidance tailored to your business needs. Our experienced coaches 
            understand the Canadian market and regulatory landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Coach Profile */}
          <Card className="lg:col-span-1 border-border">
            <CardHeader className="text-center pb-4">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src="/placeholder-coach.jpg" alt="Patrick Farrar" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  PF
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-bold text-navy">Patrick Farrar</h3>
              <p className="text-blue-text">Business Development & AI Strategy Consultant</p>
              <div className="flex items-center justify-center mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">4.9/5 (127 reviews)</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed mb-6">
                Patrick has helped over 500 businesses and individuals with talent and business 
                development, leveraging AI to make an impact where it's needed most. His expertise lies 
                in connecting the right people with the right opportunities and driving strategic growth 
                through innovative solutions.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {["Business Development", "Talent Strategy", "AI Implementation", "Strategic Growth"].map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-secondary text-secondary-foreground">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Book Free Consultation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-muted-foreground text-muted-foreground hover:bg-muted"
                >
                  Apply to be a Coach
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <div className="lg:col-span-2 space-y-6">
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