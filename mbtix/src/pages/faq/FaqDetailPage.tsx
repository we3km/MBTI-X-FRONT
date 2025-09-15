import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPublicFaqById, type Faq } from '../../api/faqApi';
import './Faq.css';
import './FaqDetailPage.css';

const FaqDetailPage = () => {
    const { faqId } = useParams<{ faqId: string }>();
    const [faq, setFaq] = useState<Faq | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (faqId) {
            const getFaq = async () => {
                try {
                    const data = await fetchPublicFaqById(Number(faqId));
                    setFaq(data);
                } catch (error) {
                    console.error("FAQ 상세 정보를 불러오는 중 에러 발생:", error);
                    navigate('/faqs'); // 에러 발생 시 목록으로
                }
            };
            getFaq();
        }
    }, [faqId, navigate]);

    if (!faq) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="faq-detail-container">
                <div className="page-header">
                <div className="page-icon">❓</div>
                <h1>FAQ</h1>
            </div>

            <div className="faq-detail-card">
                <div className="faq-question-section">
                    <span className="faq-category-tag">{faq.faqCategory}</span>
                    <h2 className="faq-question-title">Q. {faq.question}</h2>
                </div>

                <div className="faq-answer-section">
                    <p className="faq-answer-text">{faq.answer}</p>
                </div>
            </div>

            <div className="faq-actions">
                <button className="back-button" onClick={() => navigate('/faqs')}>
                    목록으로
                </button>
            </div>
        </div>
    );
};

export default FaqDetailPage;