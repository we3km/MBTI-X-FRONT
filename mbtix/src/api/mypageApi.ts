import axios, { AxiosHeaders } from "axios";
import { store } from "../store/store";

const API_BASE = "http://localhost:8085/api/";
const getAccessToken = () => store.getState().auth.accessToken;

export const mypageApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
})

mypageApi.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (!config.headers) {
        config.headers = new AxiosHeaders();
    }
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    return config;
});

export const updateNick = async (newNickname: string, userId: number, point: number) => {
  const res = await mypageApi.put("/updateNick", null, {
    params: { newNickname, userId, point },
  });
  return res.data;
};

export const checkPw = async (currentPw: string, userId: number): Promise<boolean> => {
  const res = await mypageApi.get<boolean>("/checkPw", { 
    params: { currentPw,userId}
  });
  return res.data;
};


export const updatePw = async (newPW : string, userId: number) =>{
  const res = await mypageApi.put("/updatePw",null,{
    params : { newPW,userId },
  });
  return res.data
};

export const updateProfileImg = async (userId: number, file: File) => {
  const formData = new FormData();
  formData.append("userId", String(userId));
  formData.append("file", file);

  const res = await mypageApi.put("/updateProfileImg", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getScores = async (userId: number) => {
  const res = await mypageApi.get(`/score/${userId}`);
  return res.data;
};

export const getBoard = async (userId: number) =>{
  const res = await mypageApi.get(`/myBoard/${userId}`);
  return res.data
}