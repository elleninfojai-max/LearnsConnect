import React from 'react';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ArrowLeft, ArrowRight, CheckCircle, Send } from 'lucide-react';
import Step1 from '@/components/institution-signup/Step1';
import Step2 from '@/components/institution-signup/Step2';
import Step3 from '@/components/institution-signup/Step3';
import Step4 from '@/components/institution-signup/Step4';
import Step5 from '@/components/institution-signup/Step5';
import Step6 from '@/components/institution-signup/Step6';
import Step7 from '@/components/institution-signup/Step7';
import { toast } from 'sonner';

export default function InstitutionSignup() {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    canGoNext, 
    canGoPrev,
    stepCompletionStatus,
    isFormComplete,
    submitAllSteps
  } = useInstitutionSignup();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      case 6:
        return <Step6 />;
      case 7:
        return <Step7 />;
      default:
        return <Step1 />;
    }
  };


  // Handle final submission
  const handleFinalSubmit = async () => {
    if (!isFormComplete) {
      toast.error('Please complete all steps before submitting');
      return;
    }

    try {
      const result = await submitAllSteps();
      
      if (result.success) {
        toast.success('Institution signup submitted successfully!');
        // Redirect to success page or dashboard
      } else {
        toast.error(`Submission failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred during submission');
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Join as an Institution
              </CardTitle>
              <CardDescription className="text-lg">
                Connect with students and grow your educational institution
              </CardDescription>
              
              <div className="mt-6">
                <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="mb-8">
                {renderStep()}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={!canGoPrev}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canGoNext}
                    className="flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={!isFormComplete}
                    className="flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Application</span>
                  </Button>
                )}
              </div>

              <div className="text-center mt-6">
                {isFormComplete ? (
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">All steps completed! Ready to submit.</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Complete all steps to submit your application
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
