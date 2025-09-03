import React from "react";
import styles from "./Signup.module.css";

interface Props {
  step: number;
}

export default function SignupStepProgress({ step }: Props) {
  const steps = ["약관동의", "정보입력", "가입완료"];
  return (
    <div className={styles.stepProgress}>
      {steps.map((label, idx) => (
        <React.Fragment key={idx}>
          <div
            className={`${styles.step} ${step >= idx ? styles.completed : ""}`}
          >
            <div className={styles.circle} />
            <span>{label}</span>
          </div>
          {idx < steps.length - 1 && <div className={styles.line} />}
        </React.Fragment>
      ))}
    </div>
  );
};