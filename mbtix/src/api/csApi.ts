import apiClient from './apiClient';

// 문의 데이터
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
}

// 새 문의 생성 시 보낼 데이터 타입
export type CreateInquiryData = {
    inquiryTitle: string;
    inquiryContent: string;
    csCategory: number;
}

// 내 문의 목록 조회
export const getMyInquiries = async (): Promise<Inquiry[]> => {
    const response = await apiClient.get('/cs/inquiries');
    return response.data;
};

// 내 문의 상세 조회
export const getMyInquiryById = async (inquiryId: number): Promise<Inquiry> => {
    const response = await apiClient.get(`/cs/inquiries/${inquiryId}`);
    return response.data;
};

// 새 문의 작성
export const createInquiry = async (data: CreateInquiryData): Promise<Inquiry> => {
    const response = await apiClient.post('/cs/inquiries', data);
    return response.data;
};