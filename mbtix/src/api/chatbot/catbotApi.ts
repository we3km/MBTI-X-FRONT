import axios, { AxiosHeaders } from "axios";
import { store } from "../../store/store";

const API_BASE = "http://localhost:8085/api/chatbot";
const getAccessToken = () => store.getState().auth.accessToken;
export const chatbotApi = axios.create({
    baseURL:API_BASE,
    withCredentials:true,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
})

// ===== request interceptor: Bearer 토큰 붙이기 =====
chatbotApi.interceptors.request.use((config) => {
  const token = getAccessToken();
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  return config;
});