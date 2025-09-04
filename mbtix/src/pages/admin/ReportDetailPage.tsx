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
                adminUserNum: 1 // 실제 관리자 번호로 변경 필요
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
        return <div>로딩 중...</div>;
    }

    return (
    <div className="report-detail-container">
        <div className="page-icon">🚨</div>
        <h1>신고 상세 내역</h1>

        <div className="report-info-box">
            <div className="info-header">신고 정보</div>
            <div className="info-grid">
                <div>신고 번호</div>
                <div>{report.reportId}</div>
                <div>신고 유형</div>
                <div>{report.reportCategoryName}</div>

                <div>신고자</div>
                <div>{report.reporterNickname} ({report.reporterId})</div>
                <div>신고 대상</div>
                <div>{report.reportedNickname} ({report.reportedId})</div>

                <div>신고일</div>
                <div>{new Date(report.createdAt).toLocaleDateString()}</div>
                <div>처리일</div>
                <div>{report.processedAt ? new Date(report.processedAt).toLocaleDateString() : '-'}</div>
            </div>
        </div>

        <div className="report-content-box">
            <div className="content-header">신고 상세 사유</div>
            <textarea readOnly value={report.reson || '상세 사유 없음'} />
        </div>
        
        <div className="report-action-box">
            <select onChange={handleBanChange} disabled={report.status === 'Y'}>
                <option value="0">선택</option>
                <option value="3">3일 정지</option>
                <option value="7">7일 정지</option>
                <option value="30">30일 정지</option>
                <option value="-1">영구 정지</option>
            </select>
            <button onClick={handleSubmit} disabled={report.status === 'Y'}>
                {report.status === 'Y' ? '처리 완료됨' : '제출'}
            </button>

        </div>
    </div>
);
};

export default ReportDetailPage;