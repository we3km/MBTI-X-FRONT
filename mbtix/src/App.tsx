import './App.css'
import { Route, Routes } from 'react-router-dom'

import List from './pages/board/List'
import Insert from './pages/board/Insert'
import Detail from './pages/board/Detail'
import Question from './pages/board/question'
import Mbti from './pages/board/Mbti'
import SignupPage from './pages/login/SignupPage'
import LoginPage from './pages/login/Login'
import ProtectedRoute from './components/ProtectedRoute';
import MainPage from './pages/mainpage';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { authApi } from './api/authApi';
import { setAuth } from './features/authSlice';
import AuthGate from './components/AuthGate';

function App() {
    /* 
    5173/board => 게시글 목록
    5173/board/new => 게시글 등록
    5173/board/1 => 1번게시글 상세보기
    5173/board/2 => 2번게시글 상세보기
  */
   const dispatch = useDispatch();
   useEffect(()=>{
     authApi.post("/refresh")
     .then( res => {
       dispatch(setAuth(res.data));
     })
   })

return (
  <AuthGate>
    {/* <Header /> */}
    <section id="content">
      <Routes>
        {/* <Route path="/" element={<MainPage />}/> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path='/board'  >
          <Route path='' element={<List/>}/>
          <Route path='new' element={<Insert/>} />
          <Route path=':id' element={<Detail/>}/>
        </Route>
        <Route path="/question">
          <Route path='' element={<Question/>}/>
        </Route>
        <Route path="/Mbti">
          <Route path='' element={<Mbti/>}/>
        </Route>
      </Routes>
    </section>
  </AuthGate>
);
}

export default App
