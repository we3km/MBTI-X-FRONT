import apiClient from './apiClient';
import { type PageInfo } from '../type/logintype';

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
    fileName?: string;
    deletedByUser?: 'Y' | 'N';
}

// 페이지네이션
export interface InquiryPageResponse {
    pi: PageInfo;
    list: Inquiry[];
}

// 목록 조회
export const fetchAllInquiries = async (status: 'Y' | 'N' | undefined, cpage: number): Promise<InquiryPageResponse> => {
    const response = await apiClient.get('/admin/inquiries', {
        params: { status, cpage }
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

// 문의를 ID로 받아 숨김 처리
export const hideInquiries = async (inquiryIds: number[]): Promise<void> => {
    await Promise.all(
        inquiryIds.map(id => apiClient.delete(`/admin/inquiries/${id}`))
    );
};