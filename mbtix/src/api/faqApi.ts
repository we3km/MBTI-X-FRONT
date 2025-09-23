import apiClient from './apiClient';
import { type PageInfo } from '../type/logintype';

export interface Faq {
    faqId: number;
    faqCategory: string;
    question: string;
    answer: string;
    createdAt: string;
}

export interface FaqPageResponse {
    pi: PageInfo;
    list: Faq[];
}

// FAQ 목록 조회 (사용자, 관리자)
export const fetchAllFaqs = async (page: number): Promise<FaqPageResponse> => {
    const response = await apiClient.get('/faqs', {
        params: { cpage: page }
    });
    return response.data;
};

// FAQ 상세 조회 (사용자, 관리자)
export const fetchFaqDetail = async (faqId: number): Promise<Faq> => {
    const response = await apiClient.get(`/faqs/${faqId}`);
    return response.data;
};

// 생성
type CreateFaqData = Omit<Faq, 'faqId' | 'createdAt'>;

export const createFaq = async (faqData: CreateFaqData): Promise<Faq> => {
    const response = await apiClient.post('/faqs', faqData);
    return response.data;
};

// 수정
export const updateFaq = async (faqId: number, faqData: CreateFaqData): Promise<Faq> => {
    const response = await apiClient.put(`/faqs/${faqId}`, faqData);
    return response.data;
};

// 삭제
export const deleteFaq = async (faqId: number): Promise<void> => {
    await apiClient.delete(`/admin/faqs/${faqId}`);
};