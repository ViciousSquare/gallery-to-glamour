import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-navy mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">
              <strong>Last updated:</strong> {currentDate}
            </p>

            <div className="space-y-8 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using AI for Canadians website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">2. Description of Service</h2>
                <p className="mb-4">
                  AI for Canadians provides:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Educational resources about artificial intelligence</li>
                  <li>Curated information on AI programs and opportunities</li>
                  <li>Coaching and consultation services</li>
                  <li>Connection to AI experts and professionals</li>
                  <li>Information about Canadian AI initiatives and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">3. User Responsibilities</h2>
                <p className="mb-4">
                  You agree to:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Provide accurate and complete information when requested</li>
                  <li>Use the service for lawful purposes only</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Not use the service to transmit harmful or malicious content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">4. Coaching Services</h2>
                <p className="mb-4">
                  Our coaching services are subject to additional terms:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Services are provided "as is" based on our expertise and experience</li>
                  <li>Results may vary and are not guaranteed</li>
                  <li>Cancellation policies will be communicated separately</li>
                  <li>Confidentiality agreements may apply</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">5. Intellectual Property</h2>
                <p className="mb-4">
                  The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the site are protected under applicable copyrights, trademarks and other proprietary rights.
                </p>
                <p>
                  You may not modify, copy, distribute, transmit, display, reproduce or create derivative works from our content without our express written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">6. Third-Party Resources</h2>
                <p>
                  Our website may contain links to third-party websites and resources. We are not responsible for the content, privacy policies, or practices of these external sites. Your use of third-party resources is at your own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">7. Disclaimer of Warranties</h2>
                <p className="mb-4">
                  THE INFORMATION, SOFTWARE, PRODUCTS, AND SERVICES INCLUDED IN OR AVAILABLE THROUGH THE SITE MAY INCLUDE INACCURACIES OR TYPOGRAPHICAL ERRORS. CHANGES ARE PERIODICALLY ADDED TO THE INFORMATION HEREIN.
                </p>
                <p>
                  AI FOR CANADIANS AND/OR ITS SUPPLIERS MAY MAKE IMPROVEMENTS AND/OR CHANGES IN THE SITE AT ANY TIME.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">8. Limitation of Liability</h2>
                <p>
                  IN NO EVENT SHALL AI FOR CANADIANS AND/OR ITS SUPPLIERS BE LIABLE FOR ANY DIRECT, INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF USE, DATA OR PROFITS, ARISING OUT OF OR IN ANY WAY CONNECTED WITH THE USE OR PERFORMANCE OF THE SITE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">9. Privacy Policy</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the site, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">10. Termination</h2>
                <p>
                  We may terminate your access to the site, without cause or notice, which may result in the forfeiture and destruction of all information associated with your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">11. Governing Law</h2>
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of Canada and the Province of Ontario, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">12. Changes to Terms</h2>
                <p>
                  We reserve the right to make changes to our site, policies, and these Terms of Service at any time. If any of these conditions shall be deemed invalid, void, or for any reason unenforceable, that condition shall be deemed severable and shall not affect the validity and enforceability of any remaining condition.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-navy mb-4">13. Contact Information</h2>
                <p className="mb-4">
                  Questions about the Terms of Service should be sent to us:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>AI for Canadians</strong></p>
                  <p>Email: legal@aiforcanadians.org</p>
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

export default TermsOfService;