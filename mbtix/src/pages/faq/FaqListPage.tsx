import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllFaqs, type Faq } from '../../api/faqApi';
import './Faq.css';

const FaqListPage = () => {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getFaqs = async () => {
            try {
                const data = await fetchAllFaqs();
                setFaqs(data);
            } catch (error) {
                console.error("FAQ 목록을 불러오는 중 에러 발생:", error);
            }
        };
        getFaqs();
    }, []);

    const handleRowClick = (faqId: number) => {
        navigate(`/faqs/${faqId}`);
    };

    return (
        <div className="faq-container">
            <div className="page-header">
                <div className="page-icon-circle">
                    <div className="page-icon">📋</div>
                </div>
                <h1>FAQ</h1>
            </div>
            <table className="faq-table">
                <thead>
                    <tr>
                        <th>NO</th>
                        <th>문의유형</th>
                        <th>제목</th>
                        <th>작성날짜</th>
                    </tr>
                </thead>
                <tbody>
                    {faqs.map((faq) => (
                        <tr key={faq.faqId} onClick={() => handleRowClick(faq.faqId)}>
                            <td>{faq.faqId}</td>
                            <td>{faq.faqCategory}</td>
                            <td>{faq.question}</td>
                            <td>{new Date(faq.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* 페이지네이션은 추후 추가 */}
        </div>
    );
};

export default FaqListPage;