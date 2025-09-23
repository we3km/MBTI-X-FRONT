import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllFaqs, type Faq } from '../../api/faqApi';
import { type PageInfo } from '../../type/logintype';
import Pagination from '../../components/Pagination';
import './Faq.css';

const FaqListPage = () => {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const getFaqs = async () => {
            try {
                const response = await fetchAllFaqs(currentPage); 
                setFaqs(response.list);
                setPageInfo(response.pi);
            } catch (error) {
                console.error("FAQ 목록을 불러오는 중 에러 발생:", error);
            }
        };
        getFaqs();
    }, [currentPage]);

    const handleRowClick = (faqId: number) => {
        navigate(`/faqs/${faqId}`);
    };

    return (
        <div className="faq-container">
            <div className="page-header">
                <div className="page-icon-circle">
                    <div className="page-icon">❓</div>
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

            {pageInfo && <Pagination pi={pageInfo} onPageChange={setCurrentPage} />}
        </div>
    );
};

export default FaqListPage;