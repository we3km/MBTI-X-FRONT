import apiClient from './apiClient';

export interface UserInfo {
    userId: number;
    loginId: string;
    nickname: string;
    email: string;
    createdAt: string;
    statusName: string;
    point: number;
    roles: string[];
}

export interface BanHistory {
    bannedId: number;
    reson: string;
    penaltyDate: string;
    releasaeDate: string;
}

export interface ReportHistory {
    reportId: number;
    targetNickname: string;
    reportCategoryName: string;
    createdAt: string;
    status: string;
}

export interface UserDetail {
    userInfo: UserInfo;
    banHistory: BanHistory[];
    reportsMade: ReportHistory[];
    reportsReceived: ReportHistory[];
}

// 회원 상세 정보 조회
export const fetchUserDetail = async (userId: number): Promise<UserDetail> => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
};

export const banUser = async (userId: number, banDuration: number, reason: string): Promise<string> => {
    const response = await apiClient.post(`/admin/users/${userId}/ban`, { banDuration, reason });
    return response.data;
}

// 권한 변경
export const updateUserRole = async (userId: number, newRole: 'ROLE_USER' | 'ROLE_ADMIN'): Promise<string> => {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { newRole });
    return response.data;
};

// 정지 해제
export const unbanUser = async (userId: number): Promise<string> => {
    const response = await apiClient.delete(`/admin/users/${userId}/ban`);
    return response.data;
};