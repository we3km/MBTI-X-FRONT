import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyInquiryById, type Inquiry } from '../../api/csApi';
import './CsInquiry.css';

const UPLOADS_BASE_URL = "http://localhost:8085/api/uploads/cs/";

const CsInquiryDetailPage = () => {
    const { inquiryId } = useParams<{ inquiryId: string }>();
    const navigate = useNavigate();
    const [inquiry, setInquiry] = useState<Inquiry | null>(null);

    useEffect(() => {
        if (inquiryId) {
            const loadInquiryDetail = async () => {
                try {
                    const data = await getMyInquiryById(Number(inquiryId));
                    setInquiry(data);
                } catch (error) {
                    console.error("문의 상세 정보를 불러오는 중 에러 발생:", error);
                }
            };
            loadInquiryDetail();
        }
    }, [inquiryId]);

    if (!inquiry) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="cs-inquiry-container">
            <div className="page-header">
                <div className="page-icon">📄</div>
                <h1>문의 상세 내역</h1>
            </div>

            <div className="detail-view-box">
                <div className="detail-header">
                    <h3>{inquiry.inquiryTitle}</h3>
                    <div className="meta-info">
                        <span>작성일: {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                        <span className={`status-badge status-${inquiry.status}`}>
                            {inquiry.status === 'Y' ? '답변 완료' : '대기중'}
                        </span>
                    </div>
                </div>
                <div className="detail-content my-question">
                    <h4>문의 내용</h4>
                    <p>{inquiry.inquiryContent}</p>

                    {inquiry.fileName && (
                        <div className="attachment-box">
                            <h4>첨부 파일</h4>
                            <img src={UPLOADS_BASE_URL + inquiry.fileName}
                                 alt="첨부 이미지"
                                 className="attached-image" />
                        </div>
                    )}
                </div>
            </div>

            {inquiry.answer && (
                <div className="detail-view-box">
                    <div className="detail-header">
                        <h3>관리자 답변</h3>
                        <div className="meta-info">
                            <span>답변일: {new Date(inquiry.answerAt!).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="detail-content admin-answer">
                        <p>{inquiry.answer}</p>
                    </div>
                </div>
            )}
            
            <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => navigate('/cs-history')}>목록으로</button>
            </div>
        </div>
    );
};

export default CsInquiryDetailPage;