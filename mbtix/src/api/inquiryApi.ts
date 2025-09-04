import apiClient from './apiClient';

export interface Inquiry {
    inquiryId: number;
    userId: number;
    inquiryTitle: string;
    inquiryContent: string;
    createdAt: string;
    answer: string | null;
    answerAt: string | null;
    status: 'Y' | 'N';
    csCategory: number;
    userLoginId: string;
    userNickname: string;
}

// 목록 조회
export const fetchAllInquiries = async (status?: 'Y' | 'N'): Promise<Inquiry[]> => {
    const response = await apiClient.get('/admin/inquiries', {
        params: { status }
    });
    return response.data;
};

// 상세 조회
export const fetchInquiryById = async (inquiryId: number): Promise<Inquiry> => {
    const response = await apiClient.get(`/admin/inquiries/${inquiryId}`);
    return response.data;
};

// 답변 등록
export const submitAnswer = async (inquiryId: number, answer: string): Promise<string> => {
    const response = await apiClient.post(`/admin/inquiries/${inquiryId}/answer`, { answer });
    return response.data;
};