import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInquiry, type CreateInquiryData } from '../../api/csApi';
import './CsInquiry.css';

const CsInquiryFormPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<CreateInquiryData>({
        inquiryTitle: '',
        inquiryContent: '',
        csCategory: 1
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'csCategory' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.inquiryTitle.trim() || !formData.inquiryContent.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        setIsLoading(true);
        try {
            await createInquiry(formData);
            alert('문의가 성공적으로 등록되었습니다.');
            navigate('/cs-history');
        } catch (error) {
            console.error('문의 등록 중 에러 발생:', error);
            alert('문의 등록 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cs-inquiry-container">
            <div className="page-header">
                <div className="page-icon">✍️</div>
                <h1>1:1 문의하기</h1>
            </div>
            <form className="cs-inquiry-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="csCategory">문의 유형</label>
                    <select
                        id="csCategory"
                        name="csCategory"
                        value={formData.csCategory}
                        onChange={handleChange}
                    >
                        <option value={1}>게시판 및 게임 이용 문의</option>
                        <option value={2}>계정 및 회원 문의</option>
                        <option value={3}>버그 및 오류 문의</option>
                        <option value={4}>기타 건의사항</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="inquiryTitle">제목</label>
                    <input
                        type="text"
                        id="inquiryTitle"
                        name="inquiryTitle"
                        value={formData.inquiryTitle}
                        onChange={handleChange}
                        placeholder="제목을 입력하세요"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="inquiryContent">내용</label>
                    <textarea
                        id="inquiryContent"
                        name="inquiryContent"
                        value={formData.inquiryContent}
                        onChange={handleChange}
                        placeholder="문의하실 내용을 자세히 적어주세요."
                        rows={12}
                        required
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? '제출 중...' : '제출하기'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={() => navigate('/cs-center')}>
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CsInquiryFormPage;