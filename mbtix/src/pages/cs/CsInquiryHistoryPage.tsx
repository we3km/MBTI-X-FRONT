import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInquiries, type Inquiry } from '../../api/csApi';
import './CsInquiry.css';

const CsInquiryHistoryPage = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadMyInquiries = async () => {
            try {
                const data = await getMyInquiries();
                setInquiries(data);
            } catch (error) {
                console.error("내 문의 내역을 불러오는 중 에러 발생:", error);
            }
        };
        loadMyInquiries();
    }, []);

    const handleRowClick = (inquiryId: number) => {
        navigate(`/cs-history/${inquiryId}`);
    };

    return (
        <div className="cs-inquiry-container">
            <div className="page-header">
                <div className="page-icon">📂</div>
                <h1>내 문의 내역</h1>
            </div>
            <table className="cs-history-table">
                <thead>
                    <tr>
                        <th>NO</th>
                        <th>제목</th>
                        <th>작성일</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {inquiries.map((inquiry) => (
                        <tr key={inquiry.inquiryId} onClick={() => handleRowClick(inquiry.inquiryId)}>
                            <td>{inquiry.inquiryId}</td>
                            <td className="inquiry-title">{inquiry.inquiryTitle}</td>
                            <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                            <td>
                                <span className={`status-badge status-${inquiry.status}`}>
                                    {inquiry.status === 'Y' ? '답변 완료' : '대기중'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CsInquiryHistoryPage;