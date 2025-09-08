import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { doLogout } from '../api/authApi';
import { getMyAlarms, markAlarmAsRead, deleteAllAlarms, type Alarm } from '../api/alarmApi';

const Header = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [alarms, setAlarms] = useState<Alarm[]>([]);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

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
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    const handleLogout = async () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            await doLogout();
            navigate('/login');
        }
    };

    const handleAlarmClick = async (alarm: Alarm) => {
        setAlarms(prevAlarms =>
            prevAlarms.map(a =>
                a.alarmId === alarm.alarmId ? { ...a, isRead: 'Y' } : a
            )
        );
        setOpenMenu(null);

        if (alarm.type === 'INQUIRY_ANSWER') {
            navigate(`/cs-history/${alarm.refId}`);
        }

        try {
            if (alarm.isRead !== 'Y') {
                await markAlarmAsRead(alarm.alarmId);
            }
        } catch (error) {
            console.error("'읽음' 처리 중 에러 발생:", error);
        }
    };

    // --- [최종 수정] '모두 읽음' 버튼 클릭 시, 모든 알림 삭제 ---
    const handleClearAllAlarms = async () => {
        try {
            await deleteAllAlarms();
            setAlarms([]); // UI 즉시 업데이트
        } catch (error) {
            console.error("'모두 읽음' 처리 중 에러 발생:", error);
            alert("알림을 삭제하는 중 오류가 발생했습니다.");
        }
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <Link to="/" className="header-logo">MBTI-X</Link>
                <nav className="header-nav">
                    <div className="nav-item">
                        <Link to="/board/all">게시판</Link>
                    </div>
                    <Link to="/balance-game">밸런스 게임</Link>
                    <div className="nav-item">
                        <Link to="/game/a">미니게임</Link>
                    </div>
                    <Link to="/chatbot">MBTI 챗봇</Link>
                </nav>
            </div>
            <div className="header-right">
                {isAuthenticated && user ? (
                    <>
                        <div className="nav-item">
                             <button className="user-profile-button" onClick={() => handleMenuToggle('user')}>
                                <div className="user-icon"></div>
                                <span>{user.nickname}</span>
                            </button>
                            {openMenu === 'user' && (
                                <div className="dropdown-menu user-menu">
                                    <Link to="/mypage">마이페이지</Link>
                                    {isAdmin ? (
                                        <Link to="/admin">관리자페이지</Link>
                                    ) : (
                                        <Link to="/cs-center">고객센터</Link>
                                    )}
                                    <a href="#" onClick={handleLogout} style={{ cursor: 'pointer' }}>로그아웃</a>
                                </div>
                            )}
                        </div>
                        <div className="nav-item">
                             <button className="notification-button" onClick={() => handleMenuToggle('notification')}>
                                🔔
                                {unreadCount > 0 && (
                                    <span className="notification-dot">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                             {openMenu === 'notification' && (
                                <div className="dropdown-menu notification-menu">
                                   <div className="notification-header">
                                       <span>알림</span>
                                           <button onClick={handleClearAllAlarms}>모두 읽음</button> 
                                   </div>
                                   {alarms.length > 0 ? (
                                       alarms.map(alarm => (
                                           <div 
                                               key={alarm.alarmId} 
                                               className={`notification-item ${alarm.isRead !== 'Y' ? 'unread' : ''}`}
                                               onClick={() => handleAlarmClick(alarm)}
                                           >
                                               {alarm.content}
                                           </div>
                                       ))
                                   ) : (
                                    <div className="notification-item">새로운 알림이 없습니다.</div>
                                   )}
                                </div>
                            )}
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