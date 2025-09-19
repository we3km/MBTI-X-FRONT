import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import styles from './BoardHeader.module.css'
import { Link, useNavigate } from 'react-router-dom';
import { mbtiTypes } from '../../type/board';

export default function BoardHeader(){

    const user = useSelector((state:RootState) => state.auth.user);    
    const nickname = user?.nickname || '익명';
    const mbtiId = user?.mbtiId || 0 ;
    const userMbti = mbtiTypes.find( mbti => mbtiId === mbtiId)?.mbtiName || '';

    return(
        <div className={styles.header}>
        <div className={styles["header-left"]}>MBTI-X</div>
        <div className={styles["header-center"]}>
          <div className={styles.dropdown}>
            <Link to="/board">게시판 ▼</Link >
            <div className={styles["dropdown-content"]}>
              <Link to="/board">통합 게시판</Link>
              <Link to={`/mbti/${mbtiId}`}>{userMbti} 전용 게시판</Link>
            </div>
          </div>
          <Link to="/question">궁금해 게시판</Link >
          <Link to="#">미니게임</Link >
          <Link to="#">MBTI 챗봇</Link >
        </div>
        <div className={styles["header-right"]}>
          <span className={styles.nickname}>{nickname}</span>
        </div>
      </div>

    )
}