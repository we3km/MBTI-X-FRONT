import { useState } from "react";
import styles from "./Signup.module.css";


interface Props {
  onNext: () => void;
}

export default function SignupTerms({ onNext }: Props) {
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);

  const allAgreed = agree1 && agree2;

   return (
    <div className={styles.signupBox}>
      <h2>약관 동의</h2>
    

      <div className={styles.termsGroup}>
  <label>(필수) 이용약관</label>
        <textarea readOnly value={`제1조 (목적)  
본 약관은 MBTI-X(이하 "회사")가 제공하는 서비스의 이용과 관련하여 
회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (회원가입 및 이용)  
1. 이용자는 회사가 정한 절차에 따라 회원가입을 신청합니다.  
2. 회사는 내부 기준에 따라 회원가입을 승낙하거나 제한할 수 있습니다.  
3. 회원은 가입 시 허위 정보를 제공해서는 안 되며, 정보 변경 시 즉시 수정해야 합니다.  

제3조 (서비스의 제공 및 변경)  
회사는 안정적이고 지속적인 서비스 제공을 위해 최선을 다합니다.  
다만, 서비스 개선이나 운영상의 필요에 따라 서비스 내용이 변경되거나 중단될 수 있습니다.`}/>
        <div className={styles.checkBoxRow}>
    <input
      type="checkbox"
      checked={agree1}
      onChange={() => setAgree1(!agree1)}
    />
    <span>동의합니다</span>
  </div>
</div>

      <div className={styles.termsGroup}>
        <label>(필수) 개인정보 수집 및 이용</label>
        <textarea readOnly value={`1. 수집하는 개인정보 항목  
- 필수항목: 이름, 이메일, 아이디, 비밀번호, 닉네임, MBTI  
- 선택항목: 마케팅 정보 수신 여부  

2. 수집 및 이용 목적  
- 회원 식별 및 본인 확인  
- MBTI-X 서비스 제공 및 운영 관리  
- 서비스 이용 내역 분석 및 맞춤형 콘텐츠 제공  
- 고객 상담 및 민원 처리  

3. 보유 및 이용 기간  
- 회원 탈퇴 시 즉시 파기  
- 단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 법령에 따릅니다.`}/>
  <div className={styles.checkBoxRow}>
    <input
      type="checkbox"
      checked={agree2}
      onChange={() => setAgree2(!agree2)}
    />
    <span>동의합니다</span>
  </div>
      </div>


      <div className={styles.termsGroup}>
        <label> (선택) 마케팅 정보 수신 동의</label>
        <textarea readOnly value={`MBTI-X는 서비스 관련 소식, 이벤트, 프로모션, 맞춤형 광고 등 다양한 정보를 
이메일, 문자메시지 등으로 제공할 수 있습니다.  

동의하지 않으셔도 서비스 이용에는 제한이 없으며, 
동의 후에도 언제든지 수신을 거부할 수 있습니다.`}/>
<div className={styles.checkBoxRow}>
    <input
      type="checkbox"
      checked={agree3}
      onChange={() => setAgree3(!agree3)}
    />
    <span>동의합니다</span>
  </div>
      </div>

    <div className={styles.checkBoxRow}>
  <input
    type="checkbox"
    checked={agree1 && agree2 && agree3}   // 3개가 모두 true일 때 체크됨
    onChange={(e) => {
      const checked = e.target.checked;
      setAgree1(checked);
      setAgree2(checked);
      setAgree3(checked);
    }}
  />
  <span>모두 동의</span>
</div>


      <button className={styles.nextBtn} disabled={!allAgreed} onClick={onNext}>
        다음
      </button>
    </div>
  );
}