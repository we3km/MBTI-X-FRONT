import apiClient from './apiClient';
import { type PageInfo } from '../type/logintype';

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
    fileName?: string;
}

// 페이지네이션
export interface InquiryPageResponse {
    pi: PageInfo;
    list: Inquiry[];
}

// 새 문의 생성 시 보낼 데이터 타입
export type CreateInquiryData = {
    inquiryTitle: string;
    inquiryContent: string;
    csCategory: number;
}

// 내 문의 목록 조회
export const getMyInquiries = async (cpage: number): Promise<InquiryPageResponse> => {
    const response = await apiClient.get('/cs/inquiries', {
        params: { cpage }
    });
    return response.data;
};

// 내 문의 상세 조회
export const getMyInquiryById = async (inquiryId: number): Promise<Inquiry> => {
    const response = await apiClient.get(`/cs/inquiries/${inquiryId}`);
    return response.data;
};

// 새 문의 작성
export const createInquiry = async (data: CreateInquiryData, file?: File): Promise<Inquiry> => {
    const formData = new FormData();
    formData.append('inquiry', new Blob([JSON.stringify(data)], { type: "application/json" }));

    if (file) {
        formData.append('file', file);
    }
    const response = await apiClient.post('/cs/inquiries', formData);
    return response.data;
};

// 문의 삭제
export const deleteMyInquiry = async (inquiryId: number): Promise<void> => {
    await apiClient.delete(`/cs/inquiries/${inquiryId}`);
}