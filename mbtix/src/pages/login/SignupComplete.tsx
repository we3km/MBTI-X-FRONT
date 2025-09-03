import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

export default function SignupComplete() {

const navigate = useNavigate();

  return (
    <div className={styles.signupBox}>
      <h2>가입 완료!</h2>
      <p>이제 서비스를 이용할 수 있습니다 🎉</p>
      <button className={styles.completeBtn} onClick={() => navigate("/login")}>
        로그인 페이지로 이동
      </button>
    </div>
  );
}