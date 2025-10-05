import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contactSubmissionSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

const ContactSection = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    interestArea: '',
    goals: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interest = searchParams.get('interest');
    if (interest) {
      setFormData(prev => ({ ...prev, interestArea: interest }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    logger.userAction('contact_form_submitted', {
      email: formData.email,
      interestArea: formData.interestArea,
    });

    try {
      const validationResult = contactSubmissionSchema.safeParse({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        interestArea: formData.interestArea,
        goals: formData.goals,
      });

      if (!validationResult.success) {
        const validationError = validationResult.error.errors[0].message;
        logger.warn('Contact form validation failed', {
          email: formData.email,
          error: validationError,
        });
        setError(validationError);
        setLoading(false);
        return;
      }

      // Call the secure Edge Function for contact submission
      const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          company: formData.company,
          role: formData.role,
          interestArea: formData.interestArea,
          goals: formData.goals,
        }
      });

      if (error) {
        logger.apiError('contact_submission', error);

        if (error.message?.includes('Rate limit exceeded')) {
          setError('You\'ve submitted too many requests recently. Please wait before trying again.');
        } else {
          setError(error.message || 'Something went wrong. Please try again.');
        }
        setLoading(false);
        return;
      }

      logger.info('Contact form submitted successfully', {
        email: formData.email,
        submissionId: data?.id,
      });

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        role: '',
        interestArea: '',
        goals: '',
      });

    } catch (err: any) {
      logger.error('Unexpected error in contact form submission', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="text-xl text-blue-text max-w-3xl mx-auto">
            Get in touch for a free consultation. We'll help you identify the best AI opportunities 
            for your Canadian business.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="border-border shadow-xl">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-navy text-2xl">Start Your AI Journey Today</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Fill out the form below and we'll be in touch within 24 hours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {success && (
                <Alert className="bg-green-50 border-green-200 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 ml-2">
                    <strong>Success!</strong> Thank you for reaching out. We've received your message and will get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-navy mb-4 pb-2 border-b-2 border-primary/20">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-base">First Name *</Label>
                      <Input 
                        id="firstName" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Enter your first name"
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-base">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter your last name"
                        className="h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <Label htmlFor="email" className="text-base">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@company.com"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                {/* Professional Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-navy mb-4 pb-2 border-b-2 border-primary/20">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-base">Company Name</Label>
                      <Input 
                        id="company" 
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your company name"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-base">Your Role</Label>
                      <Select 
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger className="h-11">
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
                  </div>
                </div>

                {/* Interest & Goals Section */}
                <div>
                  <h3 className="text-lg font-semibold text-navy mb-4 pb-2 border-b-2 border-primary/20">
                    How Can We Help?
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="interest" className="text-base">Area of Interest</Label>
                      <Select 
                        value={formData.interestArea}
                        onValueChange={(value) => setFormData({ ...formData, interestArea: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="What interests you most?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strategy">AI Strategy</SelectItem>
                          <SelectItem value="training">Team Training</SelectItem>
                          <SelectItem value="implementation">AI Implementation</SelectItem>
                          <SelectItem value="mentorship">Ongoing Mentorship</SelectItem>
                          <SelectItem value="resources">Resource Access</SelectItem>
                          <SelectItem value="coach">Being a Coach</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goals" className="text-base">Tell us about your AI goals</Label>
                      <Textarea 
                        id="goals"
                        value={formData.goals}
                        onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                        placeholder="Describe your current challenges and what you hope to achieve with AI..."
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit"
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground py-6 px-12 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                    {!loading && <Send className="ml-2 h-5 w-5" />}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;