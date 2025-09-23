import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllFaqs, deleteFaq, type Faq } from '../../api/faqApi';
import { type PageInfo } from '../../type/logintype';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import './Faq.css';

const AdminFaqListPage = () => {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const navigate = useNavigate();
    const selectAllRef = useRef<HTMLInputElement>(null);

    const loadFaqs = async (page: number) => {
        try {
            const data = await fetchAllFaqs(page);
            setFaqs(data.list);
            setPageInfo(data.pi);
        } catch (error) {
            console.error("FAQ 목록을 불러오는 중 에러 발생:", error);
        }
    };

    useEffect(() => {
        loadFaqs(currentPage);
    }, [currentPage]);
    
    useEffect(() => {
        if (selectAllRef.current) {
            const isIndeterminate = selectedIds.length > 0 && selectedIds.length < faqs.length;
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [selectedIds, faqs.length]);

    const handleCheckboxChange = (faqId: number) => {
        setSelectedIds(prev => prev.includes(faqId) ? prev.filter(id => id !== faqId) : [...prev, faqId]);
    };
    
    const handleSelectAllChange = () => {
        if (selectedIds.length === faqs.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(faqs.map(faq => faq.faqId));
        }
    };

    const handleCreate = () => navigate('/admin/faqs/new');
    const handleRowClick = (faqId: number) => navigate(`/admin/faqs/edit/${faqId}`);

    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            toast.error('삭제할 항목을 선택해주세요.');
            return;
        }
        if (window.confirm(`선택한 ${selectedIds.length}개의 항목을 정말 삭제하시겠습니까?`)) {
            try {
                await Promise.all(selectedIds.map(id => deleteFaq(id)));
                toast.success('성공적으로 삭제되었습니다.');
                setSelectedIds([]);
                loadFaqs(currentPage);
            } catch (error) {
                console.error("FAQ 삭제 중 에러 발생:", error);
                toast.error('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="page-icon">❓</div>
                <h1>FAQ 관리</h1>
            </div>
            
            <div className="table-card">
                <table className="admin-faq-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" ref={selectAllRef} checked={faqs.length > 0 && selectedIds.length === faqs.length} onChange={handleSelectAllChange} /></th>
                            <th>NO</th>
                            <th>문의유형</th>
                            <th>제목</th>
                            <th>작성날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faqs.map((faq) => (
                            <tr key={faq.faqId}>
                                <td><input type="checkbox" checked={selectedIds.includes(faq.faqId)} onChange={() => handleCheckboxChange(faq.faqId)} /></td>
                                <td>{faq.faqId}</td>
                                <td>{faq.faqCategory}</td>
                                <td className="faq-title" onClick={() => handleRowClick(faq.faqId)}>{faq.question}</td>
                                <td>{new Date(faq.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pageInfo && <Pagination pi={pageInfo} onPageChange={setCurrentPage} />}

            <div className="admin-faq-actions">
                <button className="delete-btn" onClick={handleDelete}>삭제</button>
                <button className="create-btn" onClick={handleCreate}>글쓰기</button>
            </div>
        </div>
    );
};

export default AdminFaqListPage;