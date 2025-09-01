import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8085", // SpringBoot 서버 주소
  withCredentials: true ,            // 세션/JWT 쿠키 사용할 경우
   headers: {
    "Content-Type": "application/json",
  },
});

export default http;
