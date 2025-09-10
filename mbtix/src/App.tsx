import './App.css'

import { Navigate, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/login/SignupPage'
import LoginPage from './pages/login/Login'
import ProtectedRoute from './components/ProtectedRoute';
import MainPage from './pages/mainpage';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { authApi } from './api/authApi';
import { setAuth } from './features/authSlice';
import AuthGate from './components/AuthGate';
import TodayGame from './pages/balGame/TodayGame';
import BalanceList from './pages/balGame/BalanceList';
import PastBalance from './pages/balGame/PastBalance';
import BalanceCreate from './pages/balGame/CreateBalGame';


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
        <Route path="/balance/today" element={<TodayGame />} />
        <Route path="/balanceList" element={<BalanceList />} />
        <Route path="/balance/:gameId" element={<PastBalance />} />
        <Route path="/balance/new" element={<BalanceCreate />} />
      </Routes>
    </section>
  </AuthGate>
);

}

export default App
