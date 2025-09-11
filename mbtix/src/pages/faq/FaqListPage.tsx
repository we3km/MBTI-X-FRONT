import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPublicFaqs, type Faq } from '../../api/faqApi';
import { type PageInfo } from '../../type/logintype';
import './Faq.css';
import '../admin/UserManagementPage.css';

const FaqListPage = () => {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const getFaqs = async () => {
            try {
                const response = await fetchPublicFaqs(currentPage);
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

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= (pageInfo?.maxPage || 1)) {
            setCurrentPage(pageNumber);
        }
    };

    const pageButtons = [];
    if (pageInfo) {
        for (let i = pageInfo.startPage; i <= pageInfo.endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={i === pageInfo.currentPage ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }
    }

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

            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={pageInfo?.currentPage === 1}
                >
                    &lt;
                </button>
                {pageButtons}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={pageInfo?.currentPage === pageInfo?.maxPage}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default FaqListPage;