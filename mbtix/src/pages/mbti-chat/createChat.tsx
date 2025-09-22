// createChat.tsx (수정된 전체 코드)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { store } from "../../store/store";
import { chatbotApi } from "../../api/chatbot/catbotApi";
import styles from "./createChat.module.css";

const mbtiList = [
  "ESTJ", "ESTP", "ESFJ", "ESFP",
  "ENTJ", "ENTP", "ENFJ", "ENFP",
  "ISTJ", "ISTP", "ISFJ", "ISFP",
  "INTJ", "INTP", "INFJ", "INFP"
];

interface CreateChatComponentProps {
  onChatCreated?: (newRoom: {
    roomId: number;
    userId: number;
    botMbti: string;
    botName: string;
    createdAt: string;
    gender: string;
    talkStyle: string;
    age: number;
    personality: string; // 'features' 대신 'personality'
    appearance: string;  // 'appearance' 추가
    botProfileImageUrl: string;
  }) => void;
}

export default function CreateChat({ onChatCreated }: CreateChatComponentProps) {
  const navigate = useNavigate();
  
  // State for Step 1
  const [selectedMBTI, setSelectedMBTI] = useState<string | null>(null);
  const [botName, setBotName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [talkStyle, setTalkStyle] = useState("존대말");

  // State for Step 2
  const [personality, setPersonality] = useState("");
  const [appearance, setAppearance] = useState("");
  
  // General State
  const getUserId = () => store.getState().auth.user?.userId;
  const userId = getUserId();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [botProfileImageUrl, setBotProfileImageUrl] = useState<string | null>(null);

  // 이미지 생성 (2단계 -> 3단계)
  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const response = await chatbotApi.post("/generate-image", {
        // 1, 2단계 모든 정보 전달
        botMbti: selectedMBTI,
        botName,
        gender,
        age,
        talkStyle,
        personality,
        appearance
      }, {
          timeout: 180000, 
      });

      const imageUrl = response.data.imageUrl;
      setBotProfileImageUrl(imageUrl);
      setStep(3); // 이미지 확인 및 최종 생성 단계로 이동
    } catch (error) {
      console.error("이미지 생성 실패:", error);
      alert("이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 챗봇 최종 생성 (3단계)
  const handleCreate = async () => {
    setLoading(true);
    if (!userId || !selectedMBTI || !botName || !botProfileImageUrl) {
      alert("모든 필수 항목을 입력하고 이미지를 생성해주세요.");
      setLoading(false);
      return;
    }

    try {
      const chatData = {
        userId,
        botMbti: selectedMBTI,
        botName,
        gender,
        talkStyle,
        age,
        personality, // 'features' 대신 'personality'
        appearance,  // 'appearance' 추가
        botProfileImageUrl,
      };

      const res = await chatbotApi.post("", chatData, {
          timeout: 180000,
      });
      const newRoom = res.data;
      if (onChatCreated) {
        onChatCreated(newRoom);
      }
      navigate(`/chat/${newRoom.roomId}`, { state: {
        mbti: newRoom.botMbti,
        botName: newRoom.botName,
        gender: newRoom.gender,
        talkStyle: newRoom.talkStyle,
        age: newRoom.age,
        personality: newRoom.personality,
        appearance: newRoom.appearance,
        botProfileImageUrl: newRoom.botProfileImageUrl
      }});
    } catch (error) {
      console.error("챗봇 생성 실패:", error);
      alert("챗봇 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };
  
  const nextStep = () => {
    if (!selectedMBTI || !botName) {
      alert("MBTI와 닉네임은 필수 항목입니다.");
      return;
    }
    setStep(2);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>나만의 챗봇 만들기 ( {step} / 3 )</h2>

      {/* 1단계: 기본 정보 입력 */}
      {step === 1 && (
        <>
          <div className={styles.inputContainer}>
            <p>MBTI를 선택해주세요:</p>
            <div className={styles.mbtiList}>
              {mbtiList.map((mbti) => (
                <button
                  key={mbti}
                  className={`${styles.mbtiButton} ${selectedMBTI === mbti ? styles.selected : ""}`}
                  onClick={() => setSelectedMBTI(mbti)}
                >
                  {mbti}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputContainer}>
            <p>챗봇 닉네임을 입력해주세요:</p>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className={styles.inputField}
              placeholder="챗봇 닉네임"
            />
          </div>

          <div className={styles.inputContainer}>
            <p>성별:</p>
            <label>
              <input type="radio" name="gender" value="남자" checked={gender === "남자"} onChange={(e) => setGender(e.target.value)} /> 남자
            </label>
            <label style={{ marginLeft: "12px" }}>
              <input type="radio" name="gender" value="여자" checked={gender === "여자"} onChange={(e) => setGender(e.target.value)} /> 여자
            </label>
          </div>

          <div className={styles.inputContainer}>
            <p>나이:</p>
            <input
              type="number"
              value={age === null ? "" : age}
              onChange={(e) => setAge(Number(e.target.value))}
              className={styles.inputField}
              placeholder="나이"
            />
          </div>

          <div className={styles.inputContainer}>
            <p>말투:</p>
            <label>
              <input type="radio" name="talkStyle" value="존대말" checked={talkStyle === "존대말"} onChange={(e) => setTalkStyle(e.target.value)} /> 존대말
            </label>
            <label style={{ marginLeft: "12px" }}>
              <input type="radio" name="talkStyle" value="반말" checked={talkStyle === "반말"} onChange={(e) => setTalkStyle(e.target.value)} /> 반말
            </label>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button onClick={nextStep} className={styles.createButton}>
              다음 단계로 ➡️
            </button>
          </div>
        </>
      )}

      {/* 2단계: 상세 정보 입력 */}
      {step === 2 && (
        <>
          <div className={styles.inputContainer}>
            <p>성격:</p>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className={styles.textArea}
              rows={4}
              placeholder="예: 성격, 성향, 사용자와의 관계 등. 문장을 나눠서 입력하면 더 잘 적용됩니다."
            />
          </div>

          <div className={styles.inputContainer}>
            <p>외모:</p>
            <textarea
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              className={styles.textArea}
              rows={4}
              placeholder="예: 머리색, 복장 등. 특징을 콤마(,)로 구분하여 입력해 주세요."
            />
          </div>
          
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => setStep(1)} className={styles.createButton} style={{ backgroundColor: "#6c757d", marginRight: "10px" }}>
              ⬅️ 이전 단계로
            </button>
            <button onClick={handleGenerateImage} className={styles.createButton} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  이미지 생성중...
                </>
              ) : (
                "프로필 이미지 생성"
              )}
            </button>
          </div>
        </>
      )}

      {/* 3단계: 이미지 확인 및 최종 생성 */}
      {step === 3 && botProfileImageUrl && (
        <>
          <h3 className={styles.heading}>생성된 프로필 이미지</h3>
          <img
            src={botProfileImageUrl}
            alt="Generated Profile"
            style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
          />
          <p style={{ marginTop: "10px" }}>이미지가 마음에 드시면 챗봇을 생성하세요.</p>
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => setStep(2)} className={styles.createButton} style={{ backgroundColor: "#6c757d", marginRight: "10px" }}>
              ⬅️ 다시 만들기
            </button>
            <button onClick={handleCreate} className={styles.createButton} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  챗봇 생성중...
                </>
              ) : (
                "챗봇 생성"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}