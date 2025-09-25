import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllInquiries, hideInquiries, type Inquiry } from '../../api/inquiryApi';
import { type PageInfo } from '../../type/logintype';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import './AdminInquiry.css';

const AdminInquiryListPage = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<'all' | 'Y' | 'N'>('all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const navigate = useNavigate();

    const loadInquiries = async () => {
        try {
            const status = filter === 'all' ? undefined : filter;
            const response = await fetchAllInquiries(status, currentPage);
            setInquiries(response.list);
            setPageInfo(response.pi);
        } catch (error) {
            console.error("1:1 문의 목록을 불러오는 중 에러 발생:", error);
        }
    };

    useEffect(() => {
        loadInquiries();
    }, [filter, currentPage]);

    const handleCheckboxChange = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(inquiries.map(inq => inq.inquiryId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            toast.error("숨길 문의를 선택해주세요.");
            return;
        }
        if (window.confirm(`선택한 ${selectedIds.length}개의 문의를 목록에서 숨기시겠습니까?`)) {
            try {
                await hideInquiries(selectedIds);
                toast.success("선택한 문의를 숨김 처리했습니다.");
                setSelectedIds([]);
                loadInquiries();
            } catch (error) {
                toast.error("처리 중 오류가 발생했습니다.");
            }
        }
    };

    const handleRowClick = (inquiryId: number) => {
        navigate(`/admin/inquiries/${inquiryId}`);
    };
    
    const handleFilterChange = (newFilter: 'all' | 'Y' | 'N') => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="page-icon">💬</div>
                <h1>1:1 문의 내역</h1>
            </div>

        <div className="inquiry-filters">
            <div className="filter-group">    
                <button onClick={() => handleFilterChange('all')} className={filter === 'all' ? 'active' : ''}>전체</button>
                <button onClick={() => handleFilterChange('N')} className={filter === 'N' ? 'active' : ''}>대기중</button>
                <button onClick={() => handleFilterChange('Y')} className={filter === 'Y' ? 'active' : ''}>답변 완료</button>
            </div>
            <button className="delete-btn" onClick={handleDelete}>삭제</button>
        </div>

            <div className="table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll}
                                    checked={inquiries.length > 0 && selectedIds.length === inquiries.length}
                                />
                            </th>
                            <th>NO</th>
                            <th>상태</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries.map((inquiry) => (
                            <tr key={inquiry.inquiryId} className="clickable-row">
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(inquiry.inquiryId)}
                                        onChange={() => handleCheckboxChange(inquiry.inquiryId)}
                                    />
                                </td>
                                <td onClick={() => handleRowClick(inquiry.inquiryId)}>{inquiry.inquiryId}</td>
                                <td onClick={() => handleRowClick(inquiry.inquiryId)}><span className={`status-badge status-${inquiry.status}`}>{inquiry.status === 'Y' ? '답변 완료' : '대기중'}</span></td>
                                <td onClick={() => handleRowClick(inquiry.inquiryId)} className="inquiry-title">
                                    {inquiry.inquiryTitle}
                                    {inquiry.deletedByUser === 'Y' && 
                                        <span className="deleted-by-user-tag">(사용자 삭제)</span>
                                    }
                                </td>
                                <td onClick={() => handleRowClick(inquiry.inquiryId)}>{inquiry.userLoginId}</td>
                                <td onClick={() => handleRowClick(inquiry.inquiryId)}>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {pageInfo && <Pagination pi={pageInfo} onPageChange={setCurrentPage} />}
        </div>
    );
};

export default AdminInquiryListPage;