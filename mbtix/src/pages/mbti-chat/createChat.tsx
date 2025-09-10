import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../../store/store";
import { chatbotApi } from "../../api/chatbot/catbotApi";
import styles from "./createChat.module.css"; 
const mbtiList = [
  "ESTJ","ESTP","ESFJ","ESFP"
  ,"ENTJ","ENTP","ENFJ","ENFP"
  ,"ISTJ","ISTP","ISFJ","ISFP"
  ,"INTJ","INTP","INFJ","INFP" // 필요한 MBTI 모두
];

interface createChat{
    userId:number;
    botMbti:string;
    botName:string;
    gender: string;
    talkStyle: string;
    age: number;
    features: string; 
}

// 새로운 prop 추가
interface CreateChatComponentProps {
    onChatCreated?: (newRoom: {
    roomId: number;
    userId: number;
    botMbti: string;
    botName: string;
    createdAt: string;
    gender:string;
    talkStyle:string;
    age: number;
    features: string; 
  }) => void;
}

export default function CreateChat({ onChatCreated }: CreateChatComponentProps){
    const [selectedMBTI, setSelectedMBTI] = useState<string | null>(null);
    const [botName, setBotName] = useState<string>('');
    const [gender, setGender] = useState<string>("");      // "male" | "female"
    const [talkStyle, setTalkStyle] = useState<string>("");
    const [age, setAge] = useState<number | "">("");
    const [features, setFeatures] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<number>(1);
    const navigate = useNavigate();
    const getUserId = () => store.getState().auth.user?.userId;

    console.log("선택",gender, talkStyle, age)
    const handleCreate = () => {
      if (!selectedMBTI) return alert("MBTI를 선택해주세요!");
      const userId = getUserId();
      if (userId == null) {
          alert("로그인이 필요합니다!", );
          return;
      } 
      setLoading(true); // 버튼 비활성화 시작
      const room:createChat = {
        userId:userId,
        botMbti:selectedMBTI, 
        botName:botName,
        gender: gender,        
        talkStyle: talkStyle,
        age: typeof age === "number" ? age : 0,
        features: features
      } 

      chatbotApi
        .post("",room)
        .then((res) => {
          const roomId = res.data;
          // API 응답과 로컬 상태를 사용하여 새로운 방 객체를 생성합니다.
          const newRoom = {
            roomId: res.data,
            userId: userId,
            botMbti: selectedMBTI,
            botName: botName,
            gender:gender,
            talkStyle:talkStyle,
            createdAt: new Date().toISOString(),
            age: Number(age),
            features: features
          };

          // prop으로 받은 함수를 새로운 방 데이터와 함께 호출합니다.
          if (onChatCreated) {
            onChatCreated(newRoom);
          }

          // 새로운 채팅방으로 이동합니다.
          navigate(`/chat/${roomId}`, {
            state: { mbti: selectedMBTI, botName: botName, gender:gender, talkStyle:talkStyle, age: age,features: features },
          });
        }).catch((err)=>{
          console.log(err)
          setLoading(false); // 실패 시 다시 버튼 활성화
        })
    };

return (
  <div className={styles.container}>
    {step === 1 && (
      <>
        <h2 className={styles.heading}>챗봇 성격(MBTI)을 선택해주세요 🤖</h2>
        <div className={styles.mbtiList}>
          {mbtiList.map(mbti => (
            <button
              key={mbti}
              onClick={() => setSelectedMBTI(mbti)}
              className={`${styles.mbtiButton} ${selectedMBTI === mbti ? styles.selected : ''}`}
            >
              {mbti}
            </button>
          ))}
        </div>

        <div className={styles.inputContainer}>
          <h3 className={styles.heading}>챗봇 이름을 입력해주세요 ✍️</h3>
          <input
            type="text"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder="예: 다정한 챗봇"
            className={styles.inputField}
          />
        </div>

        <button
          onClick={() => {
            if (!selectedMBTI) return alert("MBTI를 선택해주세요!");
            if (!botName) return alert("챗봇 이름을 입력해주세요!");
            setStep(2);
          }}
          className={styles.createButton}
        >
          다음 ➡️
        </button>
      </>
    )}

    {step === 2 && (
      <>
        <div className={styles.optionContainer}>
          <h3 className={styles.heading}>성별을 선택해주세요 🚻</h3>
          <label>
            <input
              type="radio"
              name="gender"
              value="남자"
              checked={gender === "남자"}
              onChange={(e) => setGender(e.target.value)}
            />
            남자
          </label>
          <label style={{ marginLeft: "12px" }}>
            <input
              type="radio"
              name="gender"
              value="여자"
              checked={gender === "여자"}
              onChange={(e) => setGender(e.target.value)}
            />
            여자
          </label>

          <div className={styles.inputContainer}>
            <h3 className={styles.heading}>나이를 입력해주세요 🎂</h3>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder="예: 25"
              className={styles.inputField}
              min={1}
            />
          </div>

          <div className={styles.inputContainer}>
            <h3 className={styles.heading}>챗봇의 특징을 적어주세요 ✨</h3>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="예: 웃음이 많고 낯을 가려요"
              className={styles.textArea}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.optionContainer}>
          <h3 className={styles.heading}>말투 설정 🗣️</h3>
          <label>
            <input
              type="radio"
              name="talkStyle"
              value="반말"
              checked={talkStyle === "반말"}
              onChange={(e) => setTalkStyle(e.target.value)}
            />
            반말
          </label>
          <label style={{ marginLeft: "12px" }}>
            <input
              type="radio"
              name="talkStyle"
              value="존대말"
              checked={talkStyle === "존대말"}
              onChange={(e) => setTalkStyle(e.target.value)}
            />
            존대말
          </label>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setStep(1)}
            className={styles.createButton}
            style={{ backgroundColor: "#6c757d", marginRight: "10px" }}
          >
            ⬅️ 이전
          </button>

          <button
            onClick={handleCreate}
            className={styles.createButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                생성중...
              </>
            ) : (
              "선택 완료 ✅"
            )}
          </button>
        </div>
      </>
    )}
  </div>
);

}