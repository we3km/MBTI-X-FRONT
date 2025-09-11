import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './ReportDetailPage.css';

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

    const handleBanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBan(parseInt(e.target.value));
    };

    const handleSubmit = () => {
        if (!reportId || selectedBan === 0) {
            alert("정지 기간을 선택해주세요.");
            return;
        }
        
        apiClient.post(`/admin/reports/${reportId}/process`, { 
                banDuration: selectedBan,
                adminUserNum: 44 // 실제 관리자 번호로 변경 필요
            })
            .then(response => {
                alert(response.data);
                navigate('/admin/reports');
            })
            .catch(error => {
                console.error("신고 처리 중 에러 발생:", error);
                alert("신고 처리 중 오류가 발생했습니다.");
            });
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
                <select onChange={handleBanChange} disabled={report.status === 'Y'}>
                    <option value="0">제재 기간 선택</option>
                    <option value="3">3일 정지</option>
                    <option value="7">7일 정지</option>
                    <option value="30">30일 정지</option>
                    <option value="-1">영구 정지</option>
                </select>
                <button onClick={handleSubmit} disabled={report.status === 'Y'}>
                    {report.status === 'Y' ? '처리 완료됨' : '제재 적용'}
                </button>
            </div>
        </div>
    );
};

export default ReportDetailPage;