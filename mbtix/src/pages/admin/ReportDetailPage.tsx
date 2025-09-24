import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import './ReportDetailPage.css';
import { rejectReport } from '../../api/adminApi';

interface ReportDetail {
    reportId: number;
    reporterId: string;
    reporterNickname: string;
    reportedId: string;
    reportedNickname: string;
    reson: string;
    status: string;
    createdAt: string;
    processedAt: string | null;
    reportCategoryName: string;
    boardId?: number;
    commentId?: number;
}

const ReportDetailPage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState<ReportDetail | null>(null);
    const [selectedBan, setSelectedBan] = useState<number>(0);

    useEffect(() => {
        apiClient.get(`/admin/reports/${reportId}`)
            .then(response => {
                setReport(response.data);
            })
            .catch(error => {
                console.error("신고 상세 정보를 불러오는 중 에러 발생:", error);
            });
    }, [reportId]);

    const handleReject = async () => {
        if (!reportId) return;

        if (window.confirm("이 신고를 반려 처리하시겠습니까?")) {
            try {
                const message = await rejectReport(Number(reportId));
                toast.success(message);
                navigate('/admin/reports');
            } catch (error) {
                console.error("신고 반려 처리 중 에러 발생:", error);
                toast.error("처리 중 오류가 발생했습니다.");
            }
        }
    };

    const handleBanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBan(parseInt(e.target.value));
    };

    const handleSubmit = () => {
        if (!reportId || selectedBan === 0) {
            toast.error("정지 기간을 선택해주세요.");
            return;
        }
        
        apiClient.post(`/admin/reports/${reportId}/process`, { 
                banDuration: selectedBan,
                adminUserNum: 44 // 실제 관리자 번호로 변경 필요
            })
            .then(response => {
                toast.success(response.data);
                navigate('/admin/reports');
            })
            .catch(error => {
                console.error("신고 처리 중 에러 발생:", error);
                toast.error("신고 처리 중 오류가 발생했습니다.");
            });
    };

    const handleGoToContent = () => {
        if (report && report.boardId) {
            let url = `/board/${report.boardId}`;
            if (report.commentId) {
                url += `#comment-${report.commentId}`;
            }
            window.open(url, '_blank');
        }
    };

    if (!report) {
        return <div className="admin-page-container">로딩 중...</div>;
    }

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="page-icon">🚨</div>
                <h1>신고 상세 내역</h1>
            </div>

            <div className="report-detail-grid">
                {/* 신고자 정보 카드 */}
                <div className="detail-card user-card">
                    <div className="card-header">
                        <h3>신고자 정보</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">닉네임</span>
                            <span className="info-value">{report.reporterNickname}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">아이디</span>
                            <span className="info-value">{report.reporterId}</span>
                        </div>
                    </div>
                </div>

                {/* 피신고자 정보 카드 */}
                <div className="detail-card user-card">
                    <div className="card-header">
                        <h3>피신고자 정보</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">닉네임</span>
                            <span className="info-value">{report.reportedNickname}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">아이디</span>
                            <span className="info-value">{report.reportedId}</span>
                        </div>
                    </div>
                </div>

                {/* 신고 내용 카드 */}
                <div className="detail-card full-width">
                    <div className="card-header">
                        <h3>신고 내용</h3>
                        {report.boardId && (
                            <button className="go-to-board-btn" onClick={handleGoToContent}>
                                {report.commentId ? '원본 댓글 바로가기' : '원본 게시글 바로가기'}
                            </button>
                        )}
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">신고 유형</span>
                            <span className="info-value">
                                <span className="report-badge category">{report.reportCategoryName}</span>
                            </span>
                        </div>
                         <div className="info-row">
                            <span className="info-label">처리 상태</span>
                            <span className="info-value">
                                <span className={`report-badge status-${report.status}`}>
                                    {report.status === 'Y' ? '처리 완료' : '처리 대기'}
                                </span>
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">신고일</span>
                            <span className="info-value">{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">처리일</span>
                            <span className="info-value">{report.processedAt ? new Date(report.processedAt).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="reason-box">
                            <label className="info-label">상세 사유</label>
                            <textarea readOnly value={report.reson || '상세 사유 없음'} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="action-box">
                <button onClick={handleReject}
                        disabled={report.status === 'Y'}
                        className="reject-btn">반려
                </button>
            <div className="sanction-group">
                <select onChange={handleBanChange} disabled={report.status === 'Y'}>
                    <option value="0">제재 기간 선택</option>
                    <option value="3">3일 정지</option>
                    <option value="7">7일 정지</option>
                    <option value="30">30일 정지</option>
                    <option value="-1">영구 정지</option>
                </select>
                <button onClick={handleSubmit} disabled={report.status === 'Y' || selectedBan === 0}>
                    {report.status === 'Y' ? '처리 완료됨' : '제재 적용'}
                </button>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailPage;