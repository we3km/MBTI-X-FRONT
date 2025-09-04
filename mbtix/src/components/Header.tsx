import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [userRole, setUserRole] = useState('admin');
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const handleMenuToggle = (menuName: string) => {
        setOpenMenu(menuName);
    };

    const handleMenuClose = () => {
        setOpenMenu(null);
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <Link to="/" className="header-logo">MBTI-X</Link>
                <nav className="header-nav">
                    <div className="nav-item" onMouseLeave={handleMenuClose}>
                        <button onMouseEnter={() => handleMenuToggle('board')}>게시판</button>
                        {openMenu === 'board' && (
                            <div className="dropdown-menu">
                                <Link to="/board/all">전체 게시판</Link>
                                <Link to="/board/mbti">MBTI 게시판</Link>
                                <Link to="/board/ask">궁금해 게시판</Link>
                            </div>
                        )}
                    </div>
                    <Link to="/balance-game">밸런스 게임</Link>
                    <div className="nav-item" onMouseLeave={handleMenuClose}>
                        <button onMouseEnter={() => handleMenuToggle('game')}>미니게임</button>
                        {openMenu === 'game' && (
                            <div className="dropdown-menu">
                                <Link to="/game/a">미니게임 A</Link>
                                <Link to="/game/b">미니게임 B</Link>
                                <Link to="/game/c">미니게임 C</Link>
                            </div>
                        )}
                    </div>
                    <Link to="/chatbot">MBTI 챗봇</Link>
                </nav>
            </div>
            <div className="header-right">
                {isLoggedIn ? (
                    // --- 로그인 후 ---
                    <>
                        <div className="nav-item" onMouseLeave={handleMenuClose}>
                            <button className="user-profile-button" onMouseEnter={() => handleMenuToggle('user')}>
                                <div className="user-icon"></div>
                                <span>닉네임</span>
                            </button>
                            {openMenu === 'user' && (
                                <div className="dropdown-menu user-menu">
                                    <Link to="/mypage">마이페이지</Link>
                                    {userRole === 'admin' ? (
                                        <Link to="/admin/users">관리자페이지</Link>
                                    ) : (
                                        <Link to="/cs-center">고객센터</Link>
                                    )}
                                    <Link to="/logout">로그아웃</Link>
                                </div>
                            )}
                        </div>
                        <div className="nav-item" onMouseLeave={handleMenuClose}>
                             <button className="notification-button" onMouseEnter={() => handleMenuToggle('notification')}>
                                🔔
                                <span className="notification-dot"></span>
                            </button>
                             {openMenu === 'notification' && (
                                <div className="dropdown-menu notification-menu">
                                   <div className="notification-item">게시글에 댓글이 달렸습니다</div>
                                   <div className="notification-item">댓글에 답변이 달렸습니다</div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // --- 로그인 전 ---
                    <>
                        <Link to="/login" className="header-link">로그인</Link>
                        <Link to="/signup" className="header-button">회원가입</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;