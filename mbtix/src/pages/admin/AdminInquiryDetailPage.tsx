import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInquiryById, submitAnswer, type Inquiry } from '../../api/inquiryApi';
import './AdminInquiry.css';

const AdminInquiryDetailPage = () => {
    const { inquiryId } = useParams<{ inquiryId: string }>();
    const navigate = useNavigate();
    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        if (inquiryId) {
            const getInquiry = async () => {
                try {
                    const data = await fetchInquiryById(Number(inquiryId));
                    setInquiry(data);
                    if (data.answer) {
                        setAnswer(data.answer);
                    }
                } catch (error) {
                    console.error("문의 상세 정보를 불러오는 중 에러 발생:", error);
                    alert("데이터를 불러오는데 실패했습니다.");
                    navigate('/admin/inquiries');
                }
            };
            getInquiry();
        }
    }, [inquiryId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inquiryId || !answer.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }
        try {
            await submitAnswer(Number(inquiryId), answer);
            alert("답변이 성공적으로 등록되었습니다.");
            navigate('/admin/inquiries');
        } catch (error) {
            console.error("답변 등록 중 에러 발생:", error);
            alert("답변 등록 중 오류가 발생했습니다.");
        }
    };

    if (!inquiry) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="admin-page-container"> {/* --- [수정] 클래스명 변경 --- */}
            <div className="page-header">
                <div className="page-icon">📨</div>
                <h1>1:1 문의 상세</h1>
            </div>

            {/* --- [수정] 질문 영역을 카드로 감싸기 --- */}
            <div className="detail-card">
                <div className="card-header">
                    <h3>{inquiry.inquiryTitle}</h3>
                    <div className="meta-info">
                        <span>작성자: {inquiry.userNickname} ({inquiry.userLoginId})</span>
                        <span>작성일: {new Date(inquiry.createdAt).toLocaleString()}</span>
                    </div>
                </div>
                <div className="card-content">
                    <p>{inquiry.inquiryContent}</p>
                </div>
            </div>

            {/* --- [수정] 답변 영역을 카드로 감싸기 --- */}
            <div className="detail-card">
                <div className="card-header">
                    <h3>답변하기</h3>
                </div>
                <div className="card-content">
                    {inquiry.status === 'Y' ? (
                        <textarea
                            value={inquiry.answer || ''}
                            readOnly
                            disabled
                            rows={10}
                        />
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="답변을 입력하세요..."
                                rows={10}
                                required
                            />
                            <div className="action-box">
                                <button type="button" className="cancel-btn" onClick={() => navigate('/admin/inquiries')}>목록으로</button>
                                <button type="submit" className="submit-btn">답변 등록</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminInquiryDetailPage;