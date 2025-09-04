import apiClient from './apiClient';

export interface Faq {
    faqId: number;
    faqCategory: string;
    question: string;
    answer: string;
    createdAt: string;
}

type CreateFaqData = Omit<Faq, 'faqId' | 'createdAt'>;

// 1. 전체 목록 조회 (공개 API 호출)
export const fetchAllFaqs = async (): Promise<Faq[]> => {
    const response = await apiClient.get('/faqs'); // <-- /admin 제거
    return response.data;
};

// 2. 상세 조회 (공개 API 호출)
export const fetchFaqById = async (faqId: number): Promise<Faq> => {
    const response = await apiClient.get(`/faqs/${faqId}`); // <-- /admin 제거
    return response.data;
};

// 3. 생성 (관리자 API 호출)
// ...
export const createFaq = async (faqData: CreateFaqData): Promise<Faq> => {
    const response = await apiClient.post('/admin/faqs', faqData); // <-- /admin 경로 유지
    return response.data;
};

// 4. 수정 (관리자 API 호출)
export const updateFaq = async (faqId: number, faqData: CreateFaqData): Promise<Faq> => {
    const response = await apiClient.put(`/admin/faqs/${faqId}`, faqData); // <-- /admin 경로 유지
    return response.data;
};

// 5. 삭제 (관리자 API 호출)
export const deleteFaq = async (faqId: number): Promise<void> => {
    await apiClient.delete(`/admin/faqs/${faqId}`); // <-- /admin 경로 유지
};