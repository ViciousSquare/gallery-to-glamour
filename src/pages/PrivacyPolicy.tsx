import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-navy mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">
              <strong>Last updated:</strong> {currentDate}
            </p>

            <div className="space-y-8 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Submit contact forms or inquiries</li>
                  <li>Request coaching services</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Interact with our website features</li>
                </ul>
                <p>
                  This may include your name, email address, company information, and any messages you send to us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Deliver coaching services and educational resources</li>
                  <li>Send you updates about AI resources and opportunities</li>
                  <li>Improve our website and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">3. Information Sharing</h2>
                <p className="mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>With service providers who assist in our operations</li>
                  <li>When required by law or legal process</li>
                  <li>To protect our rights or the safety of others</li>
                  <li>In connection with a business transaction</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">4. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">5. Cookies and Tracking</h2>
                <p className="mb-4">
                  Our website may use cookies and similar tracking technologies to enhance your experience. These technologies help us:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Remember your preferences</li>
                  <li>Analyze website traffic and usage</li>
                  <li>Improve our services</li>
                </ul>
                <p>
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">6. Your Rights</h2>
                <p className="mb-4">
                  Depending on your location, you may have the right to:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your personal information</li>
                  <li>Restrict or object to processing</li>
                  <li>Data portability</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">7. Children's Privacy</h2>
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">8. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">9. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>AI for Canadians</strong></p>
                  <p>Email: privacy@aiforcanadians.org</p>
                  <p>Address: Toronto, Ontario, Canada</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;