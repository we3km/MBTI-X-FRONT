import './App.css'
import { Route, Routes } from 'react-router-dom'
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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={
          <ProtectedRoute requiredRoles={['ROLE_USER']}>
          <SignupPage />
          </ProtectedRoute>
        } />
      </Routes>
    </section>
  </AuthGate>
);
}

export default App
