import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Building2, 
  HelpCircle, 
  Info,
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Zap,
  Award,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/50">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          
          {/* Company Info & Logo */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-10 w-10 rounded-lg overflow-hidden shadow-soft">
                <img 
                  src="/logo.jpg" 
                  alt="LearnsConnect Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                LearnsConnect
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect, Learn, Excel. A modern platform connecting students with expert tutors and top institutions for personalized learning experiences.
            </p>
            
            {/* Key Features Quick View */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-primary" />
                <span>Verified Tutors</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Award className="h-3 w-3 text-primary" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-primary" />
                <span>Instant Matching</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Follow Us</p>
              <div className="flex items-center space-x-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links - Find Tutors & Institutions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Find Tutors
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    to="/tutors" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Browse All Tutors</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tutors?filter=verified" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Verified Tutors</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tutors?filter=online" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Online Tutoring</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tutors?filter=offline" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>In-Person Tutoring</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/student-signup" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Become a Student</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Institutions
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    to="/institutions" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Browse Institutions</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/institutions?filter=verified" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Partner Institutions</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/institution-signup" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Register Institution</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tutor-signup" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Become a Tutor</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* How It Works & Features */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                How It Works
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    to="/how-it-works" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Getting Started</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/how-it-works#for-students" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>For Students</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/how-it-works#for-tutors" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>For Tutors</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/how-it-works#for-institutions" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>For Institutions</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/signup-choice" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Create Account</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Features
              </h3>
              <ul className="space-y-2.5">
                <li className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span>Verified Tutors</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>24/7 Access</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-primary" />
                  <span>Personalized Learning</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-primary" />
                  <span>Multiple Languages</span>
                </li>
              </ul>
            </div>
          </div>

          {/* About & Support */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                About & Support
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    to="/about" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about#mission" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Our Mission</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about#team" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Our Team</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/privacy-policy" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/how-it-works#faq" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>FAQ</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">Contact Us</h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>info@learnsconnect.com</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>+91 123 456 7890</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>India</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link to="/signup-choice">
                <Button className="w-full bg-gradient-primary hover:shadow-medium transition-all">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              <p>
                © {new Date().getFullYear()} Ellen Information Technology Solutions Pvt. Ltd. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
              <Link 
                to="/privacy-policy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/about#terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/about#contact" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

