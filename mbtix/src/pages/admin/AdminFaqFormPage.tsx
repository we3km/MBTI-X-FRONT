import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createFaq, updateFaq, fetchFaqDetail, type Faq } from '../../api/faqApi';
import toast from 'react-hot-toast';
import './AdminFaq.css';

const AdminFaqFormPage = () => {
    const { faqId } = useParams<{ faqId: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(faqId);

    const [formData, setFormData] = useState({
        faqCategory: '',
        question: '',
        answer: ''
    });

    useEffect(() => {
        if (isEditMode && faqId) {
            const getFaqData = async () => {
                try {
                    const data = await fetchFaqDetail(Number(faqId));
                    setFormData({
                        faqCategory: data.faqCategory,
                        question: data.question,
                        answer: data.answer
                    });
                } catch (error) {
                    console.error("FAQ 데이터를 불러오는 중 에러 발생:", error);
                    toast.error("데이터를 불러오는데 실패했습니다.");
                    navigate('/admin/faqs');
                }
            };
            getFaqData();
        }
    }, [isEditMode, faqId, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && faqId) {
                await updateFaq(Number(faqId), formData);
                toast.success('FAQ가 성공적으로 수정되었습니다.');
            } else {
                await createFaq(formData);
                toast.success('FAQ가 성공적으로 등록되었습니다.');
            }
            navigate('/admin/faqs');
        } catch (error) {
            console.error("FAQ 처리 중 에러 발생:", error);
            toast.error('처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="page-icon">✍️</div>
                <h1>{isEditMode ? 'FAQ 수정' : 'FAQ 작성'}</h1>
            </div>

            <div className="detail-card">
                <form className="admin-faq-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="faqCategory">문의유형</label>
                        <input
                            type="text"
                            id="faqCategory"
                            name="faqCategory"
                            value={formData.faqCategory}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="question">제목 (질문)</label>
                        <input
                            type="text"
                            id="question"
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="answer">답변</label>
                        <textarea
                            id="answer"
                            name="answer"
                            value={formData.answer}
                            onChange={handleChange}
                            required
                            rows={10}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/admin/faqs')}>
                            취소
                        </button>
                        <button type="submit" className="submit-btn">
                            {isEditMode ? '수정하기' : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminFaqFormPage;