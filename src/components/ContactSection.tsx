import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Linkedin } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-4">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="text-xl text-blue-text max-w-3xl mx-auto">
            Get in touch for a free consultation. We'll help you identify the best AI opportunities 
            for your Canadian business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-navy">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-navy">Email</p>
                    <p className="text-muted-foreground">patrick@aiforcanadians.org</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Linkedin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-navy">LinkedIn</p>
                    <a 
                      href="https://linkedin.com/in/patrickfarrar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      linkedin.com/in/patrickfarrar
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-navy">Start Your AI Journey Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-navy">First Name *</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Enter your first name"
                    className="border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-navy">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Enter your last name"
                    className="border-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-navy">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Enter your email address"
                  className="border-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-navy">Company Name</Label>
                <Input 
                  id="company" 
                  placeholder="Enter your company name"
                  className="border-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-navy">Your Role</Label>
                <Select>
                  <SelectTrigger className="border-input">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO/Founder</SelectItem>
                    <SelectItem value="cto">CTO/Technical Lead</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest" className="text-navy">Area of Interest</Label>
                <Select>
                  <SelectTrigger className="border-input">
                    <SelectValue placeholder="What interests you most?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strategy">AI Strategy</SelectItem>
                    <SelectItem value="training">Team Training</SelectItem>
                    <SelectItem value="implementation">AI Implementation</SelectItem>
                    <SelectItem value="mentorship">Ongoing Mentorship</SelectItem>
                    <SelectItem value="resources">Resource Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals" className="text-navy">Tell us about your AI goals</Label>
                <Textarea 
                  id="goals"
                  placeholder="Describe your current challenges and what you hope to achieve with AI..."
                  className="border-input min-h-[100px]"
                />
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
                size="lg"
              >
                Send Message
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;