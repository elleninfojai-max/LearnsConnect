import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Users, Globe, Mail, Phone, Calendar, Building2, UserCheck, CreditCard, DollarSign, RefreshCw, FileCheck, AlertTriangle, Scale, BookOpen, MapPin, Banknote } from 'lucide-react';

export default function PrivacyPolicy() {
  const location = useLocation();
  const lastUpdated = "November 1, 2025";
  const nextReview = "February 1, 2026";

  // Scroll to top when navigating to Privacy Policy page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Terms, Privacy & Payout Policy
              </h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive policy covering terms of service, privacy practices, and payout guidelines for LearnsConnect platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Effective Date: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Next Review: {nextReview}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Version 1.0
              </Badge>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Brand:</strong> LearnsConnect</p>
              <p><strong>Company:</strong> Ellen Information Technology Solutions Pvt. Ltd.</p>
              <p><strong>CIN / GST:</strong> 33AAHCE0984H1ZN</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* About LearnsConnect */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  1. About LearnsConnect
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  LearnsConnect, operated by Ellen Information Technology Solutions Pvt. Ltd., is an online education aggregator 
                  connecting students with verified tutors and institutions across India.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  The platform provides secure fee collection, tutor/institution management tools, and automated payouts through 
                  RBL Bank and RazorpayX.
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Registered Address:</p>
                  <p className="text-sm text-muted-foreground">
                    8/3, Athreyapuram 2nd Street, Choolaimedu, Chennai – 600094
                  </p>
                  <p className="text-sm font-semibold mt-3 mb-2">Banking Partner:</p>
                  <p className="text-sm text-muted-foreground">
                    RBL Bank Ltd., Velachery Branch, Chennai<br />
                    Account No.: 409002496031 | IFSC: RATN0000350
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Categories */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  2. User Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">1. Students</h3>
                    <p className="text-sm text-muted-foreground">Learners enrolling for educational or skill programs.</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">2. Tutors</h3>
                    <p className="text-sm text-muted-foreground">Verified professionals providing instructional services.</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">3. Institutions</h3>
                    <p className="text-sm text-muted-foreground">Recognized academic or training organizations.</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">4. Company (Admin)</h3>
                    <p className="text-sm text-muted-foreground">LearnsConnect management overseeing operations, verification, and payouts.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration & Account Creation */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-primary" />
                  3. Registration & Account Creation
                </h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Users must register with accurate contact details and consent to KYC verification.</li>
                  <li>Tutors/institutions must upload valid Aadhaar, PAN, GST, or business proof.</li>
                  <li>LearnsConnect may suspend or reject any account failing compliance or misusing the platform.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Lead Monetization & Access */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  4. Lead Monetization & Access
                </h2>
                <div className="space-y-3">
                  <p className="text-muted-foreground">• First 10 leads free.</p>
                  <p className="text-muted-foreground">• After that: Tutors – ₹9/lead | Institutions – ₹19/lead.</p>
                  <p className="text-muted-foreground">• Leads are verified student inquiries visible on the LearnsConnect dashboard.</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Collection Methods */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  5. Payment Collection Methods
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Option A – Direct Payment</h3>
                    <p className="text-muted-foreground">
                      Student pays the tutor/institution directly; LearnsConnect records the lead only.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Option B – Via LearnsConnect Payment System</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                      <li>Fees collected through RBL Bank UPI/VPA or RazorpayX.</li>
                      <li>Instant confirmation sent to both student and tutor/institution.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zero-Commission & Fast-Payout Offer */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Banknote className="h-6 w-6 text-primary" />
                  6. Zero-Commission & Fast-Payout Offer (Nov–Dec 2025)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border mt-4">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left font-semibold">Item</th>
                        <th className="border border-border p-3 text-left font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3 font-medium">Duration</td>
                        <td className="border border-border p-3 text-muted-foreground">1 Nov – 31 Dec 2025</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">Commission</td>
                        <td className="border border-border p-3 text-muted-foreground">0% on all payments processed via LearnsConnect</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">Payout Window</td>
                        <td className="border border-border p-3 text-muted-foreground">2 – 4 hours from verified transaction</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">Eligible Modes</td>
                        <td className="border border-border p-3 text-muted-foreground">UPI / VPA, RazorpayX, NEFT / IMPS via RBL</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">Working Hours</td>
                        <td className="border border-border p-3 text-muted-foreground">9 a.m.–9 p.m. (7 days a week); post-9 p.m. settles next working day</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">Verification</td>
                        <td className="border border-border p-3 text-muted-foreground">Valid UPI reference or invoice via CRM required</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">Post-Period</td>
                        <td className="border border-border p-3 text-muted-foreground">From 1 Jan 2026 → 1% service commission applies</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Payout Policy */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Banknote className="h-6 w-6 text-primary" />
                  7. Payout Policy (RBL Bank Guidelines)
                </h2>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left font-semibold">Mode</th>
                        <th className="border border-border p-3 text-left font-semibold">Availability</th>
                        <th className="border border-border p-3 text-left font-semibold">Payout Timeline</th>
                        <th className="border border-border p-3 text-left font-semibold">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3 font-medium">IMPS / UPI</td>
                        <td className="border border-border p-3 text-muted-foreground">24 × 7 (₹5 L per txn)</td>
                        <td className="border border-border p-3 text-muted-foreground">Instant</td>
                        <td className="border border-border p-3 text-muted-foreground">Urgent small payouts</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">NEFT</td>
                        <td className="border border-border p-3 text-muted-foreground">24 × 7 (₹5 L limit after 6:45 p.m.)</td>
                        <td className="border border-border p-3 text-muted-foreground">30 min – 2 hrs</td>
                        <td className="border border-border p-3 text-muted-foreground">Standard payouts</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">RTGS</td>
                        <td className="border border-border p-3 text-muted-foreground">24 × 7 (₹10 L limit after 7 p.m.)</td>
                        <td className="border border-border p-3 text-muted-foreground">Real-time</td>
                        <td className="border border-border p-3 text-muted-foreground">High-value settlements</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-medium">Bulk API / Upload</td>
                        <td className="border border-border p-3 text-muted-foreground">9 a.m.–7 p.m.</td>
                        <td className="border border-border p-3 text-muted-foreground">Same day</td>
                        <td className="border border-border p-3 text-muted-foreground">Batch settlements</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm font-semibold mb-2">Notes:</p>
                  <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1 ml-4">
                    <li>Transactions after 7 p.m. / holidays observe RBL's reduced limits.</li>
                    <li>Credits rely only on account number (per RBI guidelines).</li>
                    <li>All transactions logged per RBL API Banking Checklist & RBI Settlement Rules.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Refund & Cancellation */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <RefreshCw className="h-6 w-6 text-primary" />
                  8. Refund & Cancellation
                </h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Refunds only for duplicate or failed transactions verified by the bank.</li>
                  <li>Course cancellations within 24 hrs → refund subject to tutor approval.</li>
                  <li>Refunds processed via original mode within 5–7 business days.</li>
                </ul>
              </CardContent>
            </Card>

            {/* KYC & Anti-Fraud Compliance */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileCheck className="h-6 w-6 text-primary" />
                  9. KYC & Anti-Fraud Compliance
                </h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Tutor/institution verification includes Aadhaar, GMB, and Meta Business checks.</li>
                  <li>Students verified through OTP / mobile authentication.</li>
                  <li>Automated systems flag duplicates or suspicious UPI patterns.</li>
                  <li>LearnsConnect follows RBI KYC Master Direction (2016) and RBL Due-Diligence Policy.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Privacy & Security Summary */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-primary" />
                  10. Data Privacy & Security (Summary)
                </h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Encryption:</strong> AES-256 for all sensitive data.</li>
                  <li><strong>Payments:</strong> Handled by PCI-DSS certified partners (RBL Bank & Razorpay).</li>
                  <li><strong>Data Storage:</strong> No storage or resale of personal banking data.</li>
                  <li><strong>Retention:</strong> Data retained 5 years per RBI and IT Act.</li>
                  <li><strong>User Rights:</strong> Users may request correction or deletion via support@learnsconnect.com.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Confidentiality */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  11. Confidentiality
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  User information—including tutor payout details, student contact data, and session records—is used only for 
                  legitimate operational purposes within LearnsConnect and never shared for marketing without consent.
                </p>
              </CardContent>
            </Card>

            {/* Privacy Policy Details */}
            <div className="space-y-8">
              <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    12. Privacy Policy Details
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    (This section preserves your complete original Privacy Policy content.)
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Ellen Information Technology Solutions Pvt. Ltd. ("we," "our," or "us") operates the LearnsConnect platform ("Service").
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational 
                    platform that connects students with tutors and institutions.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    By using our Service, you agree to the collection and use of information in accordance with this policy. 
                    If you do not agree with our policies and practices, please do not use our Service.
                  </p>
                </CardContent>
              </Card>

            {/* Information We Collect */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Information We Collect
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                      <li>Name, email address, phone number, and mailing address</li>
                      <li>Date of birth and age verification</li>
                      <li>Profile photographs and identification documents</li>
                      <li>Educational background and qualifications</li>
                      <li>Payment and billing information</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Educational Information</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                      <li>Subjects of interest and learning goals</li>
                      <li>Academic performance and progress tracking</li>
                      <li>Session recordings and chat logs</li>
                      <li>Assignment submissions and feedback</li>
                      <li>Learning preferences and accessibility needs</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Technical Information</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                      <li>IP address, browser type, and device information</li>
                      <li>Usage patterns and platform interactions</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Location data (with your consent)</li>
                      <li>App performance and crash reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  How We Use Your Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Service Delivery</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Matching students with appropriate tutors</li>
                        <li>Facilitating educational sessions</li>
                        <li>Processing payments and transactions</li>
                        <li>Providing customer support</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Communication</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Sending important service updates</li>
                        <li>Facilitating tutor-student communication</li>
                        <li>Responding to inquiries and support requests</li>
                        <li>Sharing educational resources</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Platform Improvement</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Analyzing usage patterns and preferences</li>
                        <li>Developing new features and services</li>
                        <li>Conducting research and analytics</li>
                        <li>Personalizing user experience</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Legal Compliance</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                        <li>Meeting regulatory requirements</li>
                        <li>Preventing fraud and abuse</li>
                        <li>Enforcing terms of service</li>
                        <li>Protecting user safety and security</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">With Service Providers</h3>
                    <p className="text-muted-foreground">
                      We may share your information with trusted third-party service providers who assist us in operating our platform, 
                      including payment processors, cloud storage providers, and analytics services. These providers are bound by 
                      confidentiality agreements and are prohibited from using your information for any other purpose.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">With Educational Partners</h3>
                    <p className="text-muted-foreground">
                      We may share relevant information with tutors and institutions to facilitate educational services. 
                      This includes profile information, learning preferences, and session-related data necessary for 
                      effective teaching and learning.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Legal Requirements</h3>
                    <p className="text-muted-foreground">
                      We may disclose your information if required by law, court order, or government regulation, 
                      or if we believe such disclosure is necessary to protect our rights, property, or safety, 
                      or that of our users or the public.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Business Transfers</h3>
                    <p className="text-muted-foreground">
                      In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                      as part of the transaction. We will notify you of any such change in ownership or control.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-primary" />
                  Data Security
                </h2>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational security measures to protect your personal information 
                    against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>End-to-end encryption for sensitive data transmission</li>
                    <li>Secure data storage with access controls and monitoring</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Employee training on data protection best practices</li>
                    <li>Incident response procedures for data breaches</li>
                    <li>Multi-factor authentication for administrative access</li>
                  </ul>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Important:</strong> While we strive to protect your information, no method of transmission 
                      over the internet or electronic storage is 100% secure. We cannot guarantee absolute security, 
                      but we continuously work to improve our security measures.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Access and Portability</h3>
                      <p className="text-muted-foreground text-sm">
                        You have the right to access your personal information and receive a copy of your data 
                        in a portable format.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Correction and Updates</h3>
                      <p className="text-muted-foreground text-sm">
                        You can update or correct your personal information at any time through your account settings.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Deletion</h3>
                      <p className="text-muted-foreground text-sm">
                        You may request deletion of your account and associated data, subject to legal and 
                        operational requirements.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Marketing Opt-out</h3>
                      <p className="text-muted-foreground text-sm">
                        You can opt out of marketing communications while still receiving important service updates.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Data Processing Objection</h3>
                      <p className="text-muted-foreground text-sm">
                        You have the right to object to certain types of data processing where legally applicable.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Withdraw Consent</h3>
                      <p className="text-muted-foreground text-sm">
                        You can withdraw consent for data processing activities that require your explicit consent.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies and Tracking */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Cookies and Tracking Technologies</h2>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    We use cookies and similar tracking technologies to enhance your experience on our platform. 
                    These technologies help us:
                  </p>
                  
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Remember your preferences and login status</li>
                    <li>Analyze platform usage and performance</li>
                    <li>Provide personalized content and recommendations</li>
                    <li>Improve security and prevent fraud</li>
                    <li>Deliver relevant advertisements (with your consent)</li>
                  </ul>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Cookie Management:</strong> You can control cookie settings through your browser preferences. 
                      However, disabling certain cookies may affect platform functionality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Our platform is designed to serve users of all ages, including children under 13. We are committed 
                    to protecting children's privacy and comply with applicable children's privacy laws, including COPPA.
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Special Protections for Children</h3>
                    <ul className="list-disc list-inside text-green-700 space-y-1 ml-4">
                      <li>Parental consent required for children under 13</li>
                      <li>Limited data collection for child accounts</li>
                      <li>Enhanced security measures for child profiles</li>
                      <li>Parental access to child's account information</li>
                      <li>No behavioral advertising for children</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* International Transfers */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
                
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure that such transfers comply with applicable data protection laws and implement 
                  appropriate safeguards, including standard contractual clauses and adequacy decisions.
                </p>
              </CardContent>
            </Card>

            {/* Policy Updates */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
                
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, 
                  technology, legal requirements, or other factors. We will notify you of any material changes 
                  through email, platform notifications, or other appropriate means at least 30 days before 
                  the changes take effect.
                </p>
              </CardContent>
            </Card>
            </div>

            {/* Liability Disclaimer */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                  13. Liability Disclaimer
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  LearnsConnect acts solely as a digital intermediary. It is not liable for tutor quality, learning outcomes, 
                  or third-party service delays. Liability is limited to verified payment errors or technical faults directly 
                  caused by the platform.
                </p>
              </CardContent>
            </Card>

            {/* Dispute Resolution */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Scale className="h-6 w-6 text-primary" />
                  14. Dispute Resolution
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Disputes handled under the Arbitration & Conciliation Act (1996); Chennai courts have exclusive jurisdiction.
                </p>
              </CardContent>
            </Card>

            {/* Legal Compliance References */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  15. Legal Compliance References
                </h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>RBI Payment & Settlement Systems Act (2007)</li>
                  <li>RBL Bank Corporate Internet Banking & API Guidelines</li>
                  <li>IT Act 2000 & SPDI Rules 2011</li>
                  <li>Digital Personal Data Protection Act 2023</li>
                  <li>GST & Indian Contract Act 1872</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-none shadow-soft bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6 text-primary" />
                  16. Contact Information
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-semibold mb-2">Ellen Information Technology Solutions Pvt. Ltd.</p>
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary mt-1" />
                      <p className="text-sm text-muted-foreground">
                        8/3, Athreyapuram 2nd Street<br />
                        Choolaimedu, Chennai – 600094
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm">support@learnsconnect.com</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm">+91 8489357705</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-sm">www.learnsconnect.com</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Approved by:</strong> Director – Finance & Strategy<br />
                      Ellen Information Technology Solutions Pvt. Ltd.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
