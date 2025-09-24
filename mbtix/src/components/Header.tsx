import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useDispatch, useSelector } from 'react-redux';
import { store, type RootState } from '../store/store';
import { authApi, doLogout } from '../api/authApi';
import { getMyAlarms, markAlarmAsRead, deleteAllAlarms, type Alarm } from '../api/alarmApi';
import { FaRegBell } from 'react-icons/fa';
import { clearAuth } from '../features/authSlice';

const Header = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [alarms, setAlarms] = useState<Alarm[]>([]);

    const headerRef = useRef<HTMLElement>(null);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const loadAlarms = async () => {
                try {
                    const data = await getMyAlarms();
                    setAlarms(data);
                } catch (error) {
                    console.error("알림을 불러오는 중 에러 발생:", error);
                }
            };
            loadAlarms();
        } else {
            setAlarms([]);
        }
    }, [isAuthenticated]);

    const unreadCount = alarms.filter(alarm => alarm.isRead !== 'Y').length;

    const handleMenuToggle = (menuName: string) => {
        setOpenMenu(prevOpenMenu => (prevOpenMenu === menuName ? null : menuName));
    };

    const handleLogout = async () => {
    const token = store.getState().auth.accessToken;
    try {
      await authApi.post("/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } finally {
      dispatch(clearAuth());
      navigate("/");
    }
  }
    const handleAlarmClick = async (alarm: Alarm) => {
        setOpenMenu(null);
        if (alarm.isRead !== 'Y') {
            setAlarms(prevAlarms => prevAlarms.map(a => a.alarmId === alarm.alarmId ? { ...a, isRead: 'Y' } : a));
            try {
                await markAlarmAsRead(alarm.alarmId);
            } catch (error) {
                console.error("'읽음' 처리 중 에러 발생:", error);
            }
        }
        if (alarm.type === 'INQUIRY_ANSWER') {
            navigate(`/cs-history/${alarm.refId}`);
        }
    };

    const handleDeleteAllAlarms = async () => {
        try {
            await deleteAllAlarms();
            setAlarms([]);
        } catch (error) {
            console.error("'모두 삭제' 처리 중 에러 발생:", error);
            alert("알림을 삭제하는 중 오류가 발생했습니다.");
        }
    };

    return (
        <header className="header-container" ref={headerRef}>
            <div className="header-left">
                <Link to="/" className="header-logo">MBTI-X</Link>
                <nav className="header-nav">
                    <div className="nav-item">
                        <button className="nav-link-style" onClick={() => handleMenuToggle('board')}>게시판</button>
                        <div className={`dropdown-menu ${openMenu === 'board' ? 'active' : ''}`}>
                            <Link to="/board/all" onClick={() => setOpenMenu(null)}>전체 게시판</Link>
                            <Link to="/board/mbti" onClick={() => setOpenMenu(null)}>MBTI 게시판</Link>
                            <Link to="/board/curious" onClick={() => setOpenMenu(null)}>궁금해 게시판</Link>
                        </div>
                    </div>
                    <Link to="/balance-game">밸런스 게임</Link>
                    <div className="nav-item">
                        <button className="nav-link-style" onClick={() => handleMenuToggle('minigame')}>미니게임</button>
                        <div className={`dropdown-menu ${openMenu === 'minigame' ? 'active' : ''}`}>
                            <Link to="/miniGame" onClick={() => setOpenMenu(null)}>미니 게임 메인페이지</Link>
                            <Link to="/miniGame/SpeedQuiz" onClick={() => setOpenMenu(null)}>스피드 퀴즈</Link>
                            <Link to="/miniGame/ReactionTest" onClick={() => setOpenMenu(null)}>순발력 테스트</Link>
                            <Link to="/miniGame/OnlineGame" onClick={() => setOpenMenu(null)}>캐치마인드</Link>
                        </div>
                    </div>
                    <Link to="/chatbot">MBTI 챗봇</Link>
                </nav>
            </div>
            <div className="header-right">
                {isAuthenticated && user ? (
                    <>
                        <div className="nav-item">
                            <button className="user-profile-button" onClick={() => handleMenuToggle('user')}>
                                <div>
                                      <img
                                      src={
                                        user?.profileType === "UPLOAD"
                                          ? `http://localhost:8085/api/mypage/profile/images/${user?.profileFileName}`
                                          : `/profile/default/${user?.profileFileName || "default.jpg"}`
                                      }
                                      alt="프로필"
                                      className="profileImage"
                                    />
                                </div>
                                <span>{user.nickname}</span>
                            </button>
                            <div className={`dropdown-menu user-menu ${openMenu === 'user' ? 'active' : ''}`}>
                                <Link to="/mypage" onClick={() => setOpenMenu(null)}>마이페이지</Link>
                                {isAdmin ? (
                                    <Link to="/admin" onClick={() => setOpenMenu(null)}>관리자페이지</Link>
                                ) : (
                                    <Link to="/cs-center" onClick={() => setOpenMenu(null)}>고객센터</Link>
                                )}
                                <a href="#" onClick={handleLogout} style={{ cursor: 'pointer' }}>로그아웃</a>
                            </div>
                        </div>
                        <div className="nav-item">
                            <button className="notification-button" onClick={() => handleMenuToggle('notification')}>
                                <FaRegBell size={24} />
                                {unreadCount > 0 && <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                            </button>
                            <div className={`dropdown-menu notification-menu ${openMenu === 'notification' ? 'active' : ''}`}>
                                <div className="notification-header">
                                    <span>알림</span>
                                    <button onClick={handleDeleteAllAlarms}>모두 읽음</button>
                                </div>
                                {alarms.length > 0 ? (
                                    alarms.map(alarm => (
                                        <div key={alarm.alarmId} className={`notification-item ${alarm.isRead !== 'Y' ? 'unread' : ''}`} onClick={() => handleAlarmClick(alarm)}>
                                            {alarm.content}
                                        </div>
                                    ))
                                ) : (
                                    <div className="notification-item">새로운 알림이 없습니다.</div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <React.Fragment>
                        <Link to="/login" className="header-link">로그인</Link>
                        <Link to="/signup" className="header-button">회원가입</Link>
                    </React.Fragment>
                )}
            </div>
        </header>
    );
};

export default Header;