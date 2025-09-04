import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchFaqById, type Faq } from '../../api/faqApi';
import './Faq.css';

const FaqDetailPage = () => {
    const { faqId } = useParams<{ faqId: string }>();
    const [faq, setFaq] = useState<Faq | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (faqId) {
            const getFaq = async () => {
                try {
                    const data = await fetchFaqById(Number(faqId));
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
        <div className="faq-container">
             <div className="page-header">
                <div className="page-icon-circle">
                    <div className="page-icon">📋</div>
                </div>
                <h1>FAQ</h1>
            </div>
            <div className="faq-detail-box">
                <div className="faq-question">
                    <h3>Q. {faq.question}</h3>
                </div>
                <div className="faq-answer">
                    <p>{faq.answer}</p>
                </div>
            </div>
            <div className="faq-actions">
                <button onClick={() => navigate('/faqs')}>목록으로</button>
            </div>
        </div>
    );
};

export default FaqDetailPage;