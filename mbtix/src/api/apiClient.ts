import axios, { AxiosHeaders } from 'axios';
import { store } from '../store/store';

const apiClient = axios.create({
    baseURL: 'http://localhost:8085/api'
});

export const setupInterceptors = (store: any) => {
    apiClient.interceptors.request.use(
        (config) => {
            const token = store.getState().auth.accessToken;

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