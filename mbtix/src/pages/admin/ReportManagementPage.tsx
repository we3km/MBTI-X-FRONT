import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './ReportManagementPage.css';

// 타입 정의
interface PageInfo {
    listCount: number;
    currentPage: number;
    pageLimit: number;
    boardLimit: number;
    maxPage: number;
    startPage: number;
    endPage: number;
}

interface Report {
    reportId: number;
    reporterId: string;
    reportedId: string;
    reson: string;
    status: string;
    createdAt: string;
    processedAt: string | null;
    reportCategoryName: string;
}

const ReportManagementPage = () => {
    const [reportList, setReportList] = useState<Report[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        apiClient.get(`/admin/reports?cpage=${currentPage}`)
            .then(response => {
                setReportList(response.data.list);
                setPageInfo(response.data.pi);
            })
            .catch(error => {
                console.error("신고 목록을 불러오는 중 에러 발생:", error);
            });
    }, [currentPage]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleRowClick = (reportId: number) => {
        navigate(`/admin/reports/${reportId}`);
    };

    const pageButtons = [];
    if (pageInfo) {
        for (let i = pageInfo.startPage; i <= pageInfo.endPage; i++) {
            pageButtons.push(
                <button 
                    key={i} 
                    onClick={() => handlePageChange(i)}
                    className={i === pageInfo.currentPage ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }
    }

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="page-icon">🚨</div>
                <h1>신고 내역 관리</h1>
            </div>

            <div className="table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>NO</th>
                            <th>신고한 회원</th>
                            <th>신고된 회원</th>
                            <th>신고 사유</th>
                            <th>신고 날짜</th>
                            <th>처리 날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportList.map((report) => (
                            <tr key={report.reportId} onClick={() => handleRowClick(report.reportId)} className="clickable-row">
                                <td>{report.reportId}</td>
                                <td>{report.reporterId}</td>
                                <td>{report.reportedId}</td>
                                <td>{report.reportCategoryName}</td>
                                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                <td>{report.processedAt ? new Date(report.processedAt).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={pageInfo?.currentPage === 1}
                >
                    &lt;
                </button>
                {pageButtons}
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={pageInfo?.currentPage === pageInfo?.maxPage}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default ReportManagementPage;