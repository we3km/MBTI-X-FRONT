import axios from "axios";
import { store } from "../store/store";

// axios 인스턴스 생성
const api = axios.create({
    baseURL: "/api", // 백엔드 기본 주소
    // baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true, // 쿠키도 같이 보낼 때 사용 (JWT 쿠키 기반이면 필요)
});

// 요청 인터셉터 (요청 보내기 전에 실행)
api.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken; // store에서 바로 가져오기
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터 (응답 받으면 실행)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("인증 실패! 로그아웃 처리 필요");
        }
        return Promise.reject(error);
    }
);

export default api;
