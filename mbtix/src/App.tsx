import './App.css'
import { Route, Routes } from 'react-router-dom'

import MbtiChat from './pages/mbti-chat/mbtiChat'
import CreateChat from './pages/mbti-chat/createChat'
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
        <Route path='/chat' element={<MbtiChat />}/>
        <Route path='/createChat' element={<CreateChat/>}/>
        <Route path="/chat/:roomId" element={<MbtiChat />} />

      </Routes>
    </section>
  </AuthGate>
);
}

export default App
