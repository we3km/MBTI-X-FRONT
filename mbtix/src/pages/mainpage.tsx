import styles from "./mainpage.module.css";
import boardIcon from "../assets/main-page/게시판.png"
import miniIcon from "../assets/main-page/미니게임.png"
import balanceIcon from "../assets/main-page/밸런스 게임 이미지.png"
import chatIcon from "../assets/main-page/챗봇.png"
import mainIcon from "../assets/main-page/메인아이콘.png"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { store } from "../store/store";
import { useQuery } from "@tanstack/react-query";
import api from "../api/mainPageApi";

export default function Home() {
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getUserId = () => store.getState().auth.user?.userId;
  const userId = getUserId();
  useEffect(() => {
    setIsLoggedIn(!!userId);
    console.log("회원번호", userId);
  }, [userId]);

  // useQuery로 오늘의 밸런스 게임 제목 가져오기
  const { data: balTitle, isLoading, isError } = useQuery<string>({
    queryKey: ["balanceTitle"],
    queryFn: async () => {
      const res = await api.get("/getQuizTitle");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>데이터 로드 실패</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/MBTIGraph">
          <div className={styles.userInfo}>회원 MBTI 비율</div>
        </Link>
        {!isLoggedIn && (
          <div className={styles.authButtons}>
            <button className={styles.authButton}>로그인</button>
            <button className={styles.authButton}>회원가입</button>
          </div>
        )}

        {isLoggedIn && (
          <div className={styles.authButtons}>
            <button className={styles.authButton}>로그아웃</button>
          </div>
        )}
      </div>

      <h1 className={styles.logo}><img src={mainIcon} /></h1>
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>MBTI 챗봇</div>
          <div className={styles.cardDesc}>다른 MBTI와 대화해보자!</div>
          <img src={chatIcon} alt="MBTI 챗봇" />
        </div>

        <div
          className={!isBoardOpen ? styles.card : styles.boardCard}
          onMouseEnter={() => setIsBoardOpen(true)}
          onMouseLeave={() => setIsBoardOpen(false)}
        >
          {!isBoardOpen ? (
            <>
              <div className={styles.cardTitle}>게시판 바로가기</div>
              <div className={styles.cardDesc}>다른 사람들과 소통해보세요!</div>
              <img src={boardIcon} alt="게시판" />
            </>
          ) : (
            <div className={styles.boardMenu}>
              <button className={styles.boardBtn}>
                전체 <span>자유로운 주제로 이야기 하세요!</span>
              </button>
              <button className={styles.boardBtn}>
                궁금해! <span>다른 MBTI는 어떨까??</span>
              </button>
              <button className={styles.boardBtn}>
                MBTI <span>같은 MBTI들과 이야기 해봐요!</span>
              </button>
            </div>
          )}
        </div>

        {isLoggedIn ? (
          <Link to="/miniGame">
            <div className={styles.card}>
              <div className={styles.cardTitle}>미니게임</div>
              <div className={styles.cardDesc}>다른 MBTI와 경쟁해보세요!</div>
              <img src={miniIcon} alt="미니게임" />
            </div>
          </Link>
        ) : (
          <div
            className={styles.card}
            onClick={() => alert("로그인 후 이용 가능합니다.")}
          >
            <div className={styles.cardTitle}>미니게임</div>
            <div className={styles.cardDesc}>로그인 후 이용 가능</div>
            <img src={miniIcon} alt="미니게임" />
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardTitle}>오늘의 밸런스 게임</div>
          <div className={styles.cardDesc}>{balTitle}</div>
          <img src={balanceIcon} alt="밸런스 게임" />
        </div>
      </div>
    </div>
  );
};
