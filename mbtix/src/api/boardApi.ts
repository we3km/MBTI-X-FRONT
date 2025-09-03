import axios from "axios";

const getAccessToken = () => {
    //return store.getState().auth.accessToken;
    return '';
}

export const api =  axios.create({
    baseURL: 'http://localhost:8085/api',
    //withCredentials: true
    withCredentials: false
});

// api.interceptors.request.use(
//     (config) => {
//         const token = getAccessToken();
//         if(token){
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     }, 
//     (error) => Promise.reject(error)
// )


