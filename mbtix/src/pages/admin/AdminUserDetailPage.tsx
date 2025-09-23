import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserDetail, banUser, updateUserRole, unbanUser, type UserDetail } from '../../api/adminApi';
import toast from 'react-hot-toast';
import './AdminUserDetailPage.css';

const AdminUserDetailPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
    const [activeTab, setActiveTab] = useState('info');

    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [banDuration, setBanDuration] = useState(0);
    const [banReason, setBanReason] = useState("");

    const loadUserDetail = async () => {
        if (userId) {
            try {
                const data = await fetchUserDetail(Number(userId));
                setUserDetail(data);
            } catch (error) {
                console.error("회원 상세 정보를 불러오는 중 에러 발생:", error);
                toast.error("정보를 불러오는데 실패했습니다.");
                navigate('/admin/users');
            }
        }
    };

    useEffect(() => {
        loadUserDetail();
    }, [userId]);

    // 회원 제재 제출 함수
    const handleBanSubmit = async () => {
        if (!userId || banDuration === 0 || !banReason.trim()) {
            toast.error("제재 기간과 사유를 모두 입력해주세요.");
            return;
        }
        try {
            const message = await banUser(Number(userId), banDuration, banReason);
            toast.success(message);
            setIsBanModalOpen(false);
            loadUserDetail();
        } catch (error) {
            console.error("제재 처리 중 에러 발생:", error);
            toast.error("제재 처리 중 오류가 발생했습니다.");
        }
    };

    // 권한 변경 핸들러
    const handleRoleChange = async () => {
        if (!userId || !userDetail?.userInfo.roles) return;

        const { userInfo } = userDetail;
        const currentRole = userInfo.roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER';
        const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
        const newRoleKorean = newRole === 'ROLE_ADMIN' ? '관리자' : '일반 사용자';

        if (window.confirm(`${userInfo.nickname}님의 권한을 ${newRoleKorean}(으)로 변경하시겠습니까?`)) {
            try {
                const message = await updateUserRole(Number(userId), newRole);
                toast.success(message);
                loadUserDetail();
            } catch (error) {
                console.error("권한 변경 중 에러 발생:", error);
                toast.error("권한 변경 중 오류가 발생했습니다.");
            }
        }
    };

    // 정지 해제 핸들러
    const handleUnban = async () => {
        if (!userId || !userDetail) return;   
        if (window.confirm(`${userDetail.userInfo.nickname}님의 정지를 해제하시겠습니까?`)) {
            try {
                const message = await unbanUser(Number(userId));
                toast.success(message);
                loadUserDetail();
            } catch (error) {
                console.error("정지 해제 중 에러 발생:", error);
                toast.error("정지 해제 중 오류가 발생했습니다.");
            }
        }
    };

    if (!userDetail) {
        return <div className="admin-page-container"><div>로딩 중...</div></div>;
    }

    const { userInfo, banHistory, reportsMade, reportsReceived } = userDetail;

    return (
        <div className="admin-page-container">
            {/* --- 상단 헤더 --- */}
            <div className="user-detail-header">
                <div className="user-avatar">{userInfo.nickname.charAt(0)}</div>
                <div className="user-info-summary">
                    <h1 className="user-nickname">{userInfo.nickname}</h1>
                    <div className="user-meta">
                        <span>ID: {userInfo.loginId}</span>
                        <span>가입일: {userInfo.createdAt}</span>
                        <span className={`status-badge status-${userInfo.statusName}`}>{userInfo.statusName}</span>
                    </div>
                </div>
                <div className="action-buttons">
                    {userInfo.statusName === '정지' ? (
                        <button className="unban-button" onClick={handleUnban}>정지 해제</button>
                    ) : (
                        <button className="ban-button" onClick={() => setIsBanModalOpen(true)}>회원 제재</button>
                    )}
                    <button className="role-button" onClick={handleRoleChange}>권한 변경</button>
                </div>
            </div>

            {/* --- 탭 메뉴 --- */}
            <div className="detail-tabs">
                <div className="tab-header">
                    <button onClick={() => setActiveTab('info')} className={activeTab === 'info' ? 'active' : ''}>기본 정보</button>
                    <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>관리 기록</button>
                    <button onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}>작성한 게시글</button>
                    <button onClick={() => setActiveTab('comments')} className={activeTab === 'comments' ? 'active' : ''}>작성한 댓글</button>
                </div>
                <div className="tab-content">
                    {activeTab === 'info' && (
                        <div className="info-grid">
                            <div className="info-card">
                                <h3>계정 정보</h3>
                                <div className="info-item"><span className="label">고유번호</span><span>{userInfo.userId}</span></div>
                                <div className="info-item"><span className="label">이메일</span><span>{userInfo.email}</span></div>
                                <div className="info-item"><span className="label">보유 포인트</span><span>{userInfo.point} P</span></div>
                                <div className="info-item"><span className="label">권한</span><span>{userInfo.roles?.join(', ')}</span></div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'history' && (
                        <div className="history-grid">
                            <div className="history-card">
                                <h4>제재 내역 ({banHistory.length}건)</h4>
                                <ul>{banHistory.map(b => <li key={b.bannedId}>{b.penaltyDate}: {b.reson} (해제: {b.relesaeDate})</li>)}</ul>
                            </div>
                            <div className="history-card">
                                <h4>신고한 내역 ({reportsMade.length}건)</h4>
                                <ul>{reportsMade.map(r => <li key={r.reportId}>{r.createdAt}: {r.targetNickname}님 - {r.reportCategoryName} ({r.status})</li>)}</ul>
                            </div>
                            <div className="history-card">
                                <h4>신고받은 내역 ({reportsReceived.length}건)</h4>
                                <ul>{reportsReceived.map(r => <li key={r.reportId}>{r.createdAt}: {r.targetNickname}님에게 - {r.reportCategoryName} ({r.status})</li>)}</ul>
                            </div>
                        </div>
                    )}
                    {activeTab === 'posts' && (
                        <div className="placeholder-content">
                            <p>여기에 해당 회원이 작성한 게시글 목록이 표시</p>
                        </div>
                    )}
                    {activeTab === 'comments' && (
                        <div className="placeholder-content">
                            <p>여기에 해당 회원이 작성한 댓글 목록이 표시</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 제재 모달 UI --- */}
            {isBanModalOpen && (
                <div className="modal-overlay">
                    <div className="ban-modal">
                        <h2>회원 제재</h2>
                        <select onChange={(e) => setBanDuration(Number(e.target.value))} value={banDuration}>
                            <option value={0}>제재 기간 선택</option>
                            <option value={3}>3일 정지</option>
                            <option value={7}>7일 정지</option>
                            <option value={30}>30일 정지</option>
                            <option value={-1}>영구 정지</option>
                        </select>
                        <textarea 
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="제재 사유를 입력하세요..."
                        />
                        <div className="modal-actions">
                            <button onClick={() => setIsBanModalOpen(false)}>취소</button>
                            <button onClick={handleBanSubmit}>제재 적용</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserDetailPage;