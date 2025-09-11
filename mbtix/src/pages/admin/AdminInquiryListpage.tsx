import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllInquiries, type Inquiry } from '../../api/inquiryApi';
import { type PageInfo } from '../../type/logintype';
import './AdminInquiry.css';

const AdminInquiryListPage = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<'all' | 'Y' | 'N'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        const getInquiries = async () => {
            try {
                const status = filter === 'all' ? undefined : filter;
                const response = await fetchAllInquiries(status, currentPage);
                setInquiries(response.list);
                setPageInfo(response.pi);
            } catch (error) {
                console.error("1:1 문의 목록을 불러오는 중 에러 발생:", error);
            }
        };
        getInquiries();
    }, [filter, currentPage]);

    const handleRowClick = (inquiryId: number) => {
        navigate(`/admin/inquiries/${inquiryId}`);
    };

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= (pageInfo?.maxPage || 1)) {
            setCurrentPage(pageNumber);
        }
    };
    
    const handleFilterChange = (newFilter: 'all' | 'Y' | 'N') => {
        setFilter(newFilter);
        setCurrentPage(1);
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
                <div className="page-icon">💬</div>
                <h1>1:1 문의 내역</h1>
            </div>

            <div className="inquiry-filters">
                <button onClick={() => handleFilterChange('all')} className={filter === 'all' ? 'active' : ''}>전체</button>
                <button onClick={() => handleFilterChange('N')} className={filter === 'N' ? 'active' : ''}>미처리</button>
                <button onClick={() => handleFilterChange('Y')} className={filter === 'Y' ? 'active' : ''}>처리 완료</button>
            </div>

            <div className="table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>NO</th>
                            <th>상태</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.map((inquiry) => (
                            <tr key={inquiry.inquiryId} onClick={() => handleRowClick(inquiry.inquiryId)} className="clickable-row">
                                <td>{inquiry.inquiryId}</td>
                                <td>
                                    <span className={`status-badge status-${inquiry.status}`}>
                                        {inquiry.status === 'Y' ? '답변 완료' : '대기중'}
                                    </span>
                                </td>
                                <td className="inquiry-title">{inquiry.inquiryTitle}</td>
                                <td>{inquiry.userLoginId}</td>
                                <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
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

export default AdminInquiryListPage;