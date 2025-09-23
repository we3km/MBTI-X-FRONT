import styles from "./mainpage.module.css";
import boardIcon from "../assets/main-page/게시판.png"
import miniIcon from "../assets/main-page/미니게임.png"
import balanceIcon from "../assets/main-page/밸런스 게임 이미지.png"
import chatIcon from "../assets/main-page/챗봇.png"
import mainIcon from "../assets/main-page/메인아이콘.png"
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { clearAuth, setAuth } from "../features/authSlice";
import { authApi } from "../api/authApi";
import { store } from "../store/store"

export default function Home() {

  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balTitle, setBalTitle] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userId = useSelector((state: RootState) => state.auth.userId);
  const user = useSelector((state: RootState) => state.auth.user);

    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);


  useEffect(() => {
    setIsLoggedIn(!!userId);
    console.log("회원번호", userId);

  dispatch(
    setAuth({
      accessToken,
      refreshToken,  
      userId: userId!,
      user: user ?? null,
      retestAllowed: false,  
    })
  );
    // 오늘의 밸런스 게임 제목 얻어오기 추후에 Mapper 변경해야됨
    fetch("http://localhost:8085/api/getQuizTitle")
      .then(res => res.text())
      .then(data => setBalTitle(data)) // data는 String
      .catch(err => console.error(err));
  }, [userId,dispatch]);

  const handleLogout = async () => {
    const token = store.getState().auth.accessToken;
    try {
      await authApi.post("/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } finally {
      dispatch(clearAuth());
    }
  }
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/MBTIGraph">
            <div className={styles.userInfo}>회원 MBTI 비율</div>
          </Link>
        </div>
        {!isLoggedIn && (
          <div className={styles.authButtons}>
            <Link to="/login">
              <button className={styles.authButton}>로그인</button>
            </Link>
            <Link to="/signup">
              <button className={styles.authButton}>회원가입</button>
            </Link>
          </div>
        )}
        {isLoggedIn && (
          <div className={styles.authButtons}>

            <Link to={`/mypage`}>
            <img
          src={
            user?.profileType === "UPLOAD"
              ? `http://localhost:8085/api/mypage/profile/images/${user?.profileFileName}`
              : `/profile/default/${user?.profileFileName || "default.jpg"}`
          }
          alt="프로필"
          className={styles.profileImage}
        />
        </Link>
            <button className={styles.authButton} onClick={handleLogout}>로그아웃</button>
          </div>
        )}
      </div>
      <h1 className={styles.logo}><img src={mainIcon} /></h1>
      <div className={styles.cardWrapper}>
        <div className={styles.card}
          onClick={() => navigate("/chatbot")}
          style={{ cursor: "pointer" }}
        >
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
              <button className={styles.boardBtn} onClick={() => navigate("/board")}>
                전체 <span>자유로운 주제로 이야기 하세요!</span>
              </button>
              <button className={styles.boardBtn}  onClick={() => navigate("/board/curious")}>
                궁금해! <span>다른 MBTI는 어떨까??</span>
              </button>
              <button className={styles.boardBtn}  onClick={() => navigate(`/board/mbti`)}>
                MBTI <span>같은 MBTI들과 이야기 해봐요!</span>
              </button>
            </div>
          )}
        </div>
        {isLoggedIn ? (
          <Link to="/miniGame" className={styles.card}>
              <div className={styles.cardTitle}>미니게임</div>
              <div className={styles.cardDesc}>다른 MBTI와 경쟁해보세요!</div>
              <img src={miniIcon} alt="미니게임" />
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

        <div className={styles.card} onClick={() => navigate("/BalanceList")}>  
          <div className={styles.cardTitle}>오늘의 밸런스 게임</div>
          <div className={styles.cardDesc}>{balTitle}</div>
          <img src={balanceIcon} alt="밸런스 게임" />
        </div>

      </div>
    </div>
  );
};