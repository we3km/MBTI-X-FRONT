import React, { useState } from "react";
import SignupTerms from "./SignupTerms";
import SignupForm from "./SignupForm";
import SignupComplete from "./SignupComplete";
import SignupStepProgress from "./SignupStepProgress";

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(0);

  return (
    <div className="signup-container">
      <h1>회원가입</h1>
      <SignupStepProgress step={step} />

      {step === 0 && <SignupTerms onNext={() => setStep(1)} />}
      {step === 1 && <SignupForm onNext={() => setStep(2)} />}
      {step === 2 && <SignupComplete />}
    </div>
  );
};

export default SignupPage;