import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInquiries, deleteMyInquiry, type Inquiry } from '../../api/csApi';
import { type PageInfo } from '../../type/logintype';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import './CsInquiry.css';

const CsInquiryHistoryPage = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const navigate = useNavigate();

    const loadMyInquiries = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await getMyInquiries(page);
            setInquiries(response.list);
            setPageInfo(response.pi);
            setSelectedIds([]);
        } catch (error) {
            console.error("내 문의 내역을 불러오는 중 에러 발생:", error);
            toast.error("문의 내역을 불러오는 데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMyInquiries(currentPage);
    }, [currentPage]);

    const handleCheckboxChange = (inquiryId: number) => {
        setSelectedIds(prev =>
            prev.includes(inquiryId)
                ? prev.filter(id => id !== inquiryId)
                : [...prev, inquiryId]
        );
    };

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(inquiries.map(inquiry => inquiry.inquiryId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleRowClick = (inquiryId: number) => {
        navigate(`/cs-history/${inquiryId}`);
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            toast.error("삭제할 문의를 선택해주세요.");
            return;
        }
        if (window.confirm(`선택한 ${selectedIds.length}개의 문의를 정말로 삭제하시겠습니까?`)) {
            try {
                await Promise.all(selectedIds.map(id => deleteMyInquiry(id)));
                toast.success("선택한 문의 내역이 삭제되었습니다.");
                
                if (inquiries.length === selectedIds.length && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    loadMyInquiries(currentPage);
                }
            } catch (error) {
                console.error("문의 삭제 중 에러 발생:", error);
                toast.error("문의 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="cs-inquiry-container">
                <div className="page-header">
                    <div className="page-icon">📂</div>
                    <h1>내 문의 내역</h1>
                </div>
                <div>로딩 중...</div>
            </div>
        );
    }

    const isAllSelected = inquiries.length > 0 && selectedIds.length === inquiries.length;

    return (
        <div className="cs-inquiry-container">
            <div className="page-header">
                <div className="page-icon">📂</div>
                <h1>내 문의 내역</h1>
            </div>

            {/* 데이터가 하나라도 있을 때만 '선택 삭제' 버튼이 보입니다. */}
            {inquiries.length > 0 && (
                <div className="action-bar">
                    <button className="delete-btn" onClick={handleDelete} disabled={selectedIds.length === 0}>
                        삭제
                    </button>
                </div>
            )}

            {inquiries.length > 0 ? (
                <>
                    <table className="cs-history-table">
                        <thead>
                            <tr>
                                <th>
                                    <input 
                                        type="checkbox" 
                                        checked={isAllSelected}
                                        onChange={handleSelectAllChange} 
                                    />
                                </th>
                                <th>NO</th>
                                <th>제목</th>
                                <th>작성일</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry.inquiryId}>
                                    <td onClick={(e) => e.stopPropagation()}> {/* 체크박스 클릭 시 상세페이지 이동 방지 */}
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.includes(inquiry.inquiryId)} 
                                            onChange={() => handleCheckboxChange(inquiry.inquiryId)} 
                                        />
                                    </td>
                                    <td onClick={() => handleRowClick(inquiry.inquiryId)}>{inquiry.inquiryId}</td>
                                    <td onClick={() => handleRowClick(inquiry.inquiryId)} className="inquiry-title">{inquiry.inquiryTitle}</td>
                                    <td onClick={() => handleRowClick(inquiry.inquiryId)}>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                                    <td onClick={() => handleRowClick(inquiry.inquiryId)}>
                                        <span className={`status-badge status-${inquiry.status}`}>
                                            {inquiry.status === 'Y' ? '답변 완료' : '대기중'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pageInfo && <Pagination pi={pageInfo} onPageChange={setCurrentPage} />}
                </>
            ) : (
                <div className="empty-state-container">
                    <div className="empty-state-icon">🗑️</div>
                    <p className="empty-state-text">아직 작성한 문의가 없습니다.</p>
                    <button className="empty-state-button" onClick={() => navigate('/cs-inquiry')}>
                        1:1 문의 작성하기
                    </button>
                </div>
            )}
        </div>
    );
};

export default CsInquiryHistoryPage;