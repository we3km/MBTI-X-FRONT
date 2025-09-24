import axios, { AxiosHeaders } from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8085/api'
    // baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const setupInterceptors = (store: any) => {
    apiClient.interceptors.request.use(
        (config) => {
            const token = store.getState().auth.accessToken;
            console.log('Interceptor Token:', token);

            if (token) {
                if (!config.headers) {
                    config.headers = new AxiosHeaders();
                }
                config.headers.set('Authorization', `Bearer ${token}`);
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
};

export default apiClient;