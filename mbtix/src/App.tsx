import './App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import React from 'react';

// Component Imports
import Header from './components/Header';
import AuthGate from './components/AuthGate';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutWithHeader from './components/LayoutWithHeader';

// Page Imports
import Home from './pages/mainpage';
import LoginPage from './pages/login/Login';
import SignupPage from './pages/login/SignupPage';
import MBTIGraph from './pages/MBTIGraph/MBTIGraph';
import OAuth2Success from './pages/login/OAuth2Success';
import SocialSignup from './pages/login/socialSignup';
import Findid from './pages/login/FindId';
import Findpw from './pages/login/Findpw';
import SignupComplete from './pages/login/SignupComplete';
import MyPage from './pages/myPage/MyPage';
import UserPage from './pages/myPage/Userpage';

import TodayGame from './pages/balGame/TodayGame';
import BalanceList from './pages/balGame/BalanceList';
import PastBalance from './pages/balGame/PastBalance';
import BalanceCreate from './pages/balGame/CreateBalGame';
import MbtiTest from './pages/mbtiTest/MbtiTest';
import MbtiResult from './pages/mbtiTest/MbtiResult';
import CustomerServicePage from './pages/faq/CustomerServicePage';
import FaqListPage from './pages/faq/FaqListPage';
import FaqDetailPage from './pages/faq/FaqDetailPage';
import CsInquiryFormPage from './pages/cs/CsInquiryFormPage';
import CsInquiryHistoryPage from './pages/cs/CsInquiryHistoryPage';
import CsInquiryDetailPage from './pages/cs/CsInquiryDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ReportManagementPage from './pages/admin/ReportManagementPage';
import ReportDetailPage from './pages/admin/ReportDetailPage';
import AdminFaqListPage from './pages/admin/AdminFaqListPage';
import AdminFaqFormPage from './pages/admin/AdminFaqFormPage';
import AdminInquiryListPage from './pages/admin/AdminInquiryListpage';
import AdminInquiryDetailPage from './pages/admin/AdminInquiryDetailPage';

import List from './pages/board/List';
import Insert from './pages/board/Insert';
import Detail from './pages/board/Detail';
import Question from './pages/board/question';
import Mbti from './pages/board/Mbti';

import { useSelector } from 'react-redux';
import type { RootState } from './store/store';

function App() {
  const location = useLocation();
  const hideHeaderPaths = ['/', '/login'];
  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <AuthGate>
      {!shouldHideHeader && <Header />}
      <section id="content">
        <Routes>
          {/* --- 메인 및 로그인/회원가입 (헤더 없음) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/find-id" element={<Findid />} />
          <Route path="/find-pw" element={<Findpw />} />
          <Route path="/signup-complete" element={<SignupComplete />} />
          <Route path='/oauth2/success' element={<OAuth2Success />} />
          <Route path='/social-signup' element={<SocialSignup />} />

          {/* --- 로그인 필수 경로 (헤더 있음) --- */}
          <Route element={<LayoutWithHeader />}>
            {/* CS, FAQ, 및 기타 콘텐츠 */}
            <Route path="/cs-center" element={<CustomerServicePage />} />
            <Route path="/faqs" element={<FaqListPage />} />
            <Route path="/faqs/:faqId" element={<FaqDetailPage />} />
            <Route path="/cs-inquiry" element={<ProtectedRoute><CsInquiryFormPage /></ProtectedRoute>} />
            <Route path="/cs-history" element={<ProtectedRoute><CsInquiryHistoryPage /></ProtectedRoute>} />
            <Route path="/cs-history/:inquiryId" element={<ProtectedRoute><CsInquiryDetailPage /></ProtectedRoute>} />
            
            {/* MBTI 및 게임 관련 */}
            <Route path="/MBTIGraph" element={<MBTIGraph />} />
            <Route path="/balance/today" element={<TodayGame />} />
            <Route path="/balanceList" element={<BalanceList />} />
            <Route path="/balance/:gameId" element={<PastBalance />} />
            <Route path="/balance/new" element={<BalanceCreate />} />
            <Route path="/MbtiTest" element={useSelector((state: RootState) => state.auth.retestAllowed) ? <MbtiTest /> : <Navigate to="/" replace />} />
            <Route path="/MbtiResult" element={<MbtiResult />} />

            {/* 마이페이지 */}
            <Route path='/mypage' element={<ProtectedRoute requiredRoles={['ROLE_USER']}><MyPage /></ProtectedRoute>} />
            <Route path="/user/:userId" element={<UserPage />} />

            {/* 게시판 관련 경로 */}
            <Route path="/board">
              <Route path="" element={<ProtectedRoute><List /></ProtectedRoute>} />
              <Route path="all" element={<ProtectedRoute><List /></ProtectedRoute>} />
              <Route path="new" element={<ProtectedRoute><Insert /></ProtectedRoute>} />
              <Route path="curious" element={<ProtectedRoute><Question /></ProtectedRoute>} />
              <Route path="mbti" element={<ProtectedRoute><Mbti /></ProtectedRoute>} />
              <Route path=":id" element={<ProtectedRoute><Detail /></ProtectedRoute>} />
            </Route>

            {/* 관리자 전용 경로 */}
            <Route path="/admin" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><UserManagementPage /></ProtectedRoute>} />
            <Route path="/admin/users/:userId" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminUserDetailPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><ReportManagementPage /></ProtectedRoute>} />
            <Route path="/admin/reports/:reportId" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><ReportDetailPage /></ProtectedRoute>} />
            <Route path="/admin/faqs" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminFaqListPage /></ProtectedRoute>} />
            <Route path="/admin/faqs/new" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminFaqFormPage /></ProtectedRoute>} />
            <Route path="/admin/faqs/edit/:faqId" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminFaqFormPage /></ProtectedRoute>} />
            <Route path="/admin/inquiries" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminInquiryListPage /></ProtectedRoute>} />
            <Route path="/admin/inquiries/:inquiryId" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminInquiryDetailPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </section>
    </AuthGate>
  );
}

export default App;