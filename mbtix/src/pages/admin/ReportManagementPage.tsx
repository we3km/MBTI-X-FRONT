import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './ReportManagementPage.css';
import Pagination from '../../components/Pagination';

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
    reporterNickname: string;
    reportedNickname: string;
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

    // [추가] 검색 및 필터링을 위한 state
    const [searchType, setSearchType] = useState('reporter');
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('all');
    const [category, setCategory] = useState('all');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const params = new URLSearchParams({
                    cpage: String(currentPage),
                    status: status === 'all' ? '' : status,
                    category: category === 'all' ? '' : category,
                    searchType: keyword ? searchType : '',
                    keyword: keyword,
                });

                const response = await apiClient.get(`/admin/reports?${params.toString()}`);
                setReportList(response.data.list);
                setPageInfo(response.data.pi);
            } catch (error) {
                console.error("신고 목록을 불러오는 중 에러 발생:", error);
            }
        };

        fetchReports();
    }, [currentPage, keyword, status, category, searchType]); // [수정] 검색/필터 조건이 바뀔 때마다 API 재호출

    const handleRowClick = (reportId: number) => {
        navigate(`/admin/reports/${reportId}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const searchInput = (document.getElementById('searchInput') as HTMLInputElement).value;
        setCurrentPage(1);
        setKeyword(searchInput);
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="page-icon">🚨</div>
                <h1>신고 내역 관리</h1>
            </div>

            {/* [추가] 검색 및 필터 UI */}
            <div className="search-filter-box">
                <div className="filter-group">
                    <select className="filter-select" value={status} onChange={e => { setCurrentPage(1); setStatus(e.target.value); }}>
                        <option value="all">전체</option>
                        <option value="N">처리 대기</option>
                        <option value="Y">처리 완료</option>
                    </select>
                    <select className="filter-select" value={category} onChange={e => { setCurrentPage(1); setCategory(e.target.value); }}>
                        <option value="all">전체</option>
                        <option value="1">욕설 및 어그로</option>
                        <option value="2">음란 및 선정성</option>
                        <option value="3">도배 및 광고</option>
                        <option value="4">혐오성 글 게시</option>
                        <option value="5">기타</option>
                    </select>
                </div>
                <form className="search-form" onSubmit={handleSearch}>
                    <select value={searchType} onChange={e => setSearchType(e.target.value)}>
                        <option value="reporter">신고자</option>
                        <option value="reported">피신고자</option>
                    </select>
                    <input type="text" id="searchInput" placeholder="닉네임으로 검색..." />
                    <button type="submit">검색</button>
                </form>
            </div>

            <div className="table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>NO</th>
                            <th>신고한 회원</th>
                            <th>신고된 회원</th>
                            <th>신고 유형</th>
                            <th>신고 날짜</th>
                            <th>처리 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportList.map((report) => (
                            <tr key={report.reportId} onClick={() => handleRowClick(report.reportId)} className="clickable-row">
                                <td>{report.reportId}</td>
                                <td>{report.reporterNickname}</td>
                                <td>{report.reportedNickname}</td>
                                <td>{report.reportCategoryName}</td>
                                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                <td>{report.status === 'Y' ? '처리 완료' : '처리 대기'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pageInfo && <Pagination pi={pageInfo} onPageChange={setCurrentPage} />}
        </div>
    );
};

export default ReportManagementPage;