import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { saveCredentials, loadSavedCredentials, clearSavedCredentials, getSavedEmails, getCredentialStats } from "@/lib/credentials";
import { getPendingTutorProfile, getPendingStudentProfile, getPendingInstitutionProfile, createTutorProfileAfterVerification, createStudentProfileAfterVerification, createInstitutionProfileAfterVerification, clearPendingTutorProfile, clearPendingStudentProfile, clearPendingInstitutionProfile } from "@/lib/profile-creation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Function to redirect user to appropriate dashboard based on role
  const redirectToDashboard = async (userId: string) => {
    try {
      console.log('🔍 [Login] Fetching user profile for redirect...');
      
      // Get user profile to determine role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ [Login] Error fetching profile for redirect:', error);
        toast({
          title: "Error",
          description: "Could not determine your account type. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('🔍 [Login] User role:', profile.role);

      // Redirect based on role
      switch (profile.role) {
        case 'student':
          console.log('🔍 [Login] Redirecting to student dashboard');
          navigate('/student-dashboard');
          break;
        case 'tutor':
          console.log('🔍 [Login] Redirecting to tutor dashboard');
          navigate('/tutor-dashboard');
          break;
        case 'institution':
          console.log('🔍 [Login] Redirecting to institution dashboard');
          navigate('/institution-dashboard');
          break;
        case 'admin':
          console.log('🔍 [Login] Redirecting to admin dashboard');
          navigate('/admin/dashboard');
          break;
        default:
          console.error('❌ [Login] Unknown role:', profile.role);
          toast({
            title: "Error",
            description: "Unknown account type. Please contact support.",
            variant: "destructive",
          });
          break;
      }
    } catch (error) {
      console.error('❌ [Login] Error in redirectToDashboard:', error);
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    }
  };
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [selectedSavedEmail, setSelectedSavedEmail] = useState<string>("");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const { toast } = useToast();

  // Test localStorage functionality immediately
  useEffect(() => {
    console.log('=== TESTING LOCALSTORAGE ===');
    try {
      const testKey = '__test_localStorage__';
      localStorage.setItem(testKey, 'test_value');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      console.log('localStorage test:', testValue === 'test_value' ? 'PASSED' : 'FAILED');
      console.log('localStorage available:', typeof localStorage !== 'undefined');
    } catch (error) {
      console.error('localStorage test failed:', error);
    }
  }, []);

  // Check for saved credentials and pending profile creation on component mount
  useEffect(() => {
    console.log('=== COMPONENT MOUNT - CHECKING FOR SAVED CREDENTIALS ===');
    
    // Load saved emails for the dropdown
    const emails = getSavedEmails();
    setSavedEmails(emails);
    console.log('Saved emails found:', emails);
    
    // Load most recent credentials if any exist
    const savedCredentials = loadSavedCredentials();
    if (savedCredentials) {
      console.log('=== FOUND SAVED CREDENTIALS ===');
      console.log('Auto-filling form with most recent credentials...');
      
      // Update React state
      setFormData({
        email: savedCredentials.email,
        password: savedCredentials.password,
      });
      setRememberMe(true);
      setSelectedSavedEmail(savedCredentials.email);
      
      console.log('✅ Form auto-filled successfully');
      console.log('Form data after auto-fill:', { email: savedCredentials.email, password: savedCredentials.password });
      console.log('Remember me after auto-fill:', true);
      console.log('Selected saved email:', savedCredentials.email);
          } else {
      console.log('❌ No saved credentials found');
      console.log('This means either:');
      console.log('1. No credentials were ever saved');
      console.log('2. Credentials were cleared (e.g., during logout)');
      console.log('3. There was an error loading them');
    }
  }, []); // Empty dependency array - runs only on mount

  // Debug: watch for formData changes
  useEffect(() => {
    console.log('=== FORM DATA CHANGED ===');
    console.log('New formData:', formData);
    console.log('New rememberMe:', rememberMe);
  }, [formData, rememberMe]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`=== INPUT CHANGE: ${name} ===`);
    console.log('Previous value:', formData[name as keyof typeof formData]);
    console.log('New value:', value);
    console.log('Value type:', typeof value);
    console.log('Value length:', value.length);

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Hide resend verification button when email changes
    if (name === 'email' && showResendVerification) {
      setShowResendVerification(false);
    }
    
    console.log('Form data after update:', { ...formData, [name]: value });
  };

  // Handle account selection from dropdown
  const handleAccountSelection = (email: string) => {
    console.log('=== ACCOUNT SELECTION ===');
    console.log('Selected email:', email);
    
    if (email === "new") {
      // Clear form for new account
      setFormData({ email: "", password: "" });
      setSelectedSavedEmail("");
      console.log('✅ Form cleared for new account');
    } else {
      // Load selected account credentials
      const selectedCredentials = loadSavedCredentials(email);
      if (selectedCredentials) {
    setFormData({
          email: selectedCredentials.email,
          password: selectedCredentials.password,
        });
        setSelectedSavedEmail(email);
        setRememberMe(true);
        console.log('✅ Loaded credentials for:', email);
      } else {
        console.log('❌ No credentials found for:', email);
      }
    }
  };

  // Clear specific account credentials
  const handleClearAccount = (email: string) => {
    console.log('=== CLEARING ACCOUNT ===');
    console.log('Clearing credentials for:', email);
    
    clearSavedCredentials(email);
    
    // Update saved emails list
    const updatedEmails = getSavedEmails();
    setSavedEmails(updatedEmails);
    
    // If we cleared the currently selected account, clear the form
    if (selectedSavedEmail === email) {
      setFormData({ email: "", password: "" });
      setSelectedSavedEmail("");
      setRememberMe(false);
    }
    
    toast({
      title: "Account Cleared",
      description: `Credentials for ${email} have been removed.`,
    });
    
    console.log('✅ Account cleared successfully');
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsResendingVerification(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your email and click the verification link.",
      });
    } catch (error) {
      console.error('Error resending verification:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('=== FORM SUBMISSION START ===');
    console.log('Remember me checkbox checked:', rememberMe);
    console.log('Form data:', formData);
    console.log('Form data email:', formData.email);
    console.log('Form data password exists:', !!formData.password);
    console.log('Form data password length:', formData.password?.length || 0);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error details:', error);
        
        // Check if the error is due to unverified email
        if (error.message === 'Invalid login credentials' || error.message.includes('Invalid login credentials')) {
          // Check if user exists but is unverified
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          // If we can't get user data, it might be an unverified user
          if (userError || !userData.user) {
            // Check if there's a pending profile for this email
            const pendingTutor = getPendingTutorProfile();
            const pendingStudent = getPendingStudentProfile();
            const pendingInstitution = getPendingInstitutionProfile();
            
            const hasPendingProfile = (pendingTutor && pendingTutor.email === formData.email) ||
                                   (pendingStudent && pendingStudent.email === formData.email) ||
                                   (pendingInstitution && pendingInstitution.email === formData.email);
            
            if (hasPendingProfile) {
              setShowResendVerification(true);
              throw new Error('Please check your email and click the verification link before logging in. If you haven\'t received the email, please check your spam folder or contact support.');
            }
          }
        }
        
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('=== LOGIN SUCCESSFUL ===');
        console.log('User logged in successfully');
        console.log('User email:', data.user.email);
        
        // Hide resend verification button on successful login
        setShowResendVerification(false);
        
        // Handle remember me functionality
        if (rememberMe) {
          console.log('✅ Remember me is checked - saving credentials...');
          console.log('About to call saveCredentials with:', formData.email, formData.password ? 'PASSWORD_EXISTS' : 'NO_PASSWORD');
          console.log('Password value type:', typeof formData.password);
          console.log('Password value:', formData.password);
          
          try {
            saveCredentials(formData.email, formData.password);
            console.log('✅ saveCredentials function completed successfully');
            
            // Immediately verify what was saved
            const verifyRememberMe = localStorage.getItem('learnsconnect_remember_me');
            const verifyEmail = localStorage.getItem('learnsconnect_saved_email');
            const verifyPassword = localStorage.getItem('learnsconnect_saved_password');
            
            console.log('=== IMMEDIATE VERIFICATION ===');
            console.log('- REMEMBER_ME_KEY:', verifyRememberMe);
            console.log('- SAVED_EMAIL_KEY:', verifyEmail);
            console.log('- SAVED_PASSWORD_KEY:', verifyPassword ? 'EXISTS' : 'NOT FOUND');
            
            toast({
              title: "Credentials Saved",
              description: "Your login information has been saved for future use.",
            });
          } catch (error) {
            console.error('❌ Error saving credentials:', error);
            toast({
              title: "Warning",
              description: "Could not save credentials. Please check your browser settings.",
              variant: "destructive",
            });
          }
        } else {
          console.log('❌ Remember me is not checked - clearing saved credentials...');
          clearSavedCredentials();
        }

        toast({
          title: "Login Successful!",
          description: "Welcome back to LearnsConnect.",
        });

        // Add a delay to ensure credentials are saved before any redirect
        console.log('=== WAITING BEFORE REDIRECT ===');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('=== REDIRECT DELAY COMPLETE ===');
        
        // Check for pending profile creation
        const pendingTutor = getPendingTutorProfile();
        if (pendingTutor && data.user.email_confirmed_at) {
          console.log('=== CREATING TUTOR PROFILE ===');
          const result = await createTutorProfileAfterVerification(data.user.id, pendingTutor.formData);
          if (result.success) {
            clearPendingTutorProfile();
            toast({
              title: "Profile Created Successfully!",
              description: result.message,
            });
          }
          console.log('=== TUTOR PROFILE CREATION COMPLETE ===');
        }

        // Redirect user to appropriate dashboard based on role
        console.log('=== REDIRECTING TO DASHBOARD ===');
        await redirectToDashboard(data.user.id);

        const pendingStudent = getPendingStudentProfile();
        if (pendingStudent && data.user.email_confirmed_at) {
          console.log('=== CREATING STUDENT PROFILE ===');
          const result = await createStudentProfileAfterVerification(data.user.id, pendingStudent.formData);
          if (result.success) {
            clearPendingStudentProfile();
            toast({
              title: "Profile Created Successfully!",
              description: result.message,
            });
          }
          console.log('=== STUDENT PROFILE CREATION COMPLETE ===');
        }

        const pendingInstitution = getPendingInstitutionProfile();
        if (pendingInstitution && data.user.email_confirmed_at) {
          console.log('=== CREATING INSTITUTION PROFILE ===');
          const result = await createInstitutionProfileAfterVerification(data.user.id, pendingInstitution.formData);
          if (result.success) {
            clearPendingInstitutionProfile();
            toast({
              title: "Profile Created Successfully!",
              description: result.message,
            });
          }
          console.log('=== INSTITUTION PROFILE CREATION COMPLETE ===');
        }
        
        // Check credentials before profile fetch
        console.log('=== CHECKING CREDENTIALS BEFORE PROFILE FETCH ===');
        const beforeProfileCheck = localStorage.getItem('learnsconnect_remember_me');
        console.log('Credentials before profile fetch:', beforeProfileCheck ? 'EXIST' : 'NOT FOUND');
        

        
        // Get user's role and redirect accordingly
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          // If profile doesn't exist, redirect to home page
          console.log('Redirecting to home page due to profile error...');
          console.log('=== FINAL CREDENTIAL CHECK BEFORE REDIRECT ===');
          const finalCheck = localStorage.getItem('learnsconnect_remember_me');
          console.log('Final credentials check:', finalCheck ? 'EXIST' : 'NOT FOUND');
          window.location.href = '/';
        } else if (profileData) {
          // Redirect based on user role
          console.log('Redirecting based on user role:', profileData.role);
          console.log('=== FINAL CREDENTIAL CHECK BEFORE REDIRECT ===');
          const finalCheck = localStorage.getItem('learnsconnect_remember_me');
          console.log('Final credentials check:', finalCheck ? 'EXIST' : 'NOT FOUND');
          
          switch (profileData.role) {
            case 'student':
              window.location.href = '/student-dashboard';
              break;
            case 'tutor':
              window.location.href = '/tutor-dashboard';
              break;
            case 'institution':
              window.location.href = '/institution-dashboard';
              break;
            case 'admin':
              // TODO: Add admin dashboard route when available
              window.location.href = '/';
              break;
            default:
              window.location.href = '/';
          }
        } else {
          // No profile found, redirect to home page
          console.log('No profile found, redirecting to home page...');
          console.log('=== FINAL CREDENTIAL CHECK BEFORE REDIRECT ===');
          const finalCheck = localStorage.getItem('learnsconnect_remember_me');
          console.log('Final credentials check:', finalCheck ? 'EXIST' : 'NOT FOUND');
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-md mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 sm:mb-8 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <Card className="shadow-medium border-none">
            <CardHeader className="space-y-3 sm:space-y-4 text-center px-4 sm:px-6 pt-6 sm:pt-8">
              <CardTitle className="text-xl sm:text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Sign in to your LearnsConnect account to continue your learning journey
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Account Selection Dropdown */}
                  {savedEmails.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="account-select" className="text-sm font-medium text-gray-700">
                        Choose Saved Account
                      </Label>
                      <Select value={selectedSavedEmail} onValueChange={handleAccountSelection}>
                        <SelectTrigger className="h-11 sm:h-12">
                          <SelectValue placeholder="Select an account or add new" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">➕ Add New Account</SelectItem>
                          {savedEmails.map((email) => (
                            <SelectItem key={email} value={email}>
                              {email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>
                  </div>
                  
                  {/* Show saved emails if available */}
                  {/* This section was removed as per the new_code */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        console.log('=== CHECKBOX CHANGE ===');
                        console.log('Remember me checkbox changed to:', checked);
                        console.log('Previous state:', rememberMe);
                        console.log('Event target checked:', e.target.checked);
                        console.log('Event target type:', e.target.type);
                        
                        setRememberMe(checked);
                        
                        console.log('New state set to:', checked);
                        console.log('State after setState (will be updated in next render):', checked);
                        
                        // If unchecking, clear saved credentials
                        if (!checked) {
                          console.log('Clearing saved credentials due to checkbox uncheck');
                          clearSavedCredentials();
                        }
                      }}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                  </label>
                  </div>
                  
                  {/* Note about credential persistence */}
                  {rememberMe && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      💡 Your login information will be saved and auto-filled on future visits, even after logging out.
                    </div>
                  )}
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary-soft transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                {rememberMe && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <p className="flex items-start">
                      <span className="mr-2">🔒</span>
                      <span>
                        Your credentials will be saved locally on this device. 
                        Only use this feature on your personal, secure device.
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        clearSavedCredentials();
                        setRememberMe(false);
                        setFormData({ email: "", password: "" });
                        toast({
                          title: "Credentials Cleared",
                          description: "Your saved login information has been removed.",
                        });
                      }}
                      className="mt-2 text-primary hover:text-primary-soft text-xs underline"
                    >
                      Clear saved credentials
                    </button>
                  </div>
                )}

                {/* Saved Accounts Management */}
                {savedEmails.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Saved Accounts</h4>
                      <div className="text-xs text-gray-500">
                        {savedEmails.length} account{savedEmails.length !== 1 ? 's' : ''} saved
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {savedEmails.map((email) => (
                        <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{email}</span>
                            {selectedSavedEmail === email && (
                              <Badge variant="secondary" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearAccount(email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      💡 Your login information is encrypted and stored locally for convenience.
                    </div>
                  </div>
                )}

                {/* Resend Verification Button */}
                {showResendVerification && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-amber-800 font-medium">
                          Email verification required
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Please check your email and click the verification link to activate your account.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        {isResendingVerification ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Resend Email'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-primary shadow-soft hover:shadow-medium h-11 sm:h-12 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>


                <p className="text-center text-xs sm:text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup-choice" className="text-primary hover:text-primary-soft font-medium transition-colors">
                    Sign up here
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:text-primary-soft">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary hover:text-primary-soft">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}