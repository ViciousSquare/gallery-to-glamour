import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contactSubmissionSchema } from '@/lib/validation';

const ContactSection = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

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
        setError(validationResult.error.errors[0].message);
        setLoading(false);
        return;
      }

      // Check rate limiting - has this email submitted recently?
      const { data: recentSubmission } = await supabase
        .from('submission_rate_limits')
        .select('*')
        .eq('email', formData.email)
        .gte('submitted_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .single();

      if (recentSubmission) {
        setError('You\'ve already submitted recently. Please wait an hour before submitting again.');
        setLoading(false);
        return;
      }

      // Get user's IP and user agent (for spam tracking)
      const userAgent = navigator.userAgent;
      
      // Insert the submission
      const { error: insertError } = await supabase
        .from('contact_submissions')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          company: formData.company || null,
          role: formData.role || null,
          interest_area: formData.interestArea || null,
          goals: formData.goals || null,
          user_agent: userAgent,
        }]);

      if (insertError) throw insertError;

      // Add to rate limit table
      await supabase
        .from('submission_rate_limits')
        .insert([{
          email: formData.email,
          ip_address: 'browser', // We can't get real IP from browser, but tracks email
        }]);

      // Clean old rate limits
      await supabase.rpc('clean_old_rate_limits');

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
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-navy">Start Your AI Journey Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    Thank you! We've received your message and will get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input 
                    id="company" 
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Your Role</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="interest">Area of Interest</Label>
                  <Select 
                    value={formData.interestArea}
                    onValueChange={(value) => setFormData({ ...formData, interestArea: value })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="goals">Tell us about your AI goals</Label>
                  <Textarea 
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="Describe your current challenges and what you hope to achieve with AI..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  {!loading && <Send className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;