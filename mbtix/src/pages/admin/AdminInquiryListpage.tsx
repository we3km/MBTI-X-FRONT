import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllInquiries, type Inquiry } from '../../api/inquiryApi';
import './AdminInquiry.css';

const AdminInquiryListPage = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [filter, setFilter] = useState<'all' | 'Y' | 'N'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        const getInquiries = async () => {
            try {
                const status = filter === 'all' ? undefined : filter;
                const data = await fetchAllInquiries(status);
                setInquiries(data);
            } catch (error) {
                console.error("1:1 문의 목록을 불러오는 중 에러 발생:", error);
            }
        };
        getInquiries();
    }, [filter]);

    const handleRowClick = (inquiryId: number) => {
        navigate(`/admin/inquiries/${inquiryId}`);
    };

    return (
        <div className="admin-page-container"> {/* --- [수정] 클래스명 변경 --- */}
            <div className="page-header">
                <div className="page-icon">💬</div>
                <h1>1:1 문의 내역</h1>
            </div>

            <div className="inquiry-filters">
                <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>전체</button>
                <button onClick={() => setFilter('N')} className={filter === 'N' ? 'active' : ''}>미처리</button>
                <button onClick={() => setFilter('Y')} className={filter === 'Y' ? 'active' : ''}>처리 완료</button>
            </div>

            <div className="table-card"> {/* --- [추가] 테이블을 카드로 감싸기 --- */}
                <table className="admin-table"> {/* --- [수정] 클래스명 변경 --- */}
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
        </div>
    );
};

export default AdminInquiryListPage;