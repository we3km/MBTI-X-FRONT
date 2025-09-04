import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';

// 공통
import Header from './components/Header';

// 인증 관리
import AuthGate from './components/AuthGate';
import ProtectedRoute from './components/ProtectedRoute';

// 공개 페이지
import LoginPage from './pages/login/Login';
import SignupPage from './pages/login/SignupPage';
import CustomerServicePage from './pages/faq/CustomerServicePage';
import FaqListPage from './pages/faq/FaqListPage';
import FaqDetailPage from './pages/faq/FaqDetailPage';

// 보호된 페이지
import MainPage from './pages/mainpage';

import CsInquiryFormPage from './pages/cs/CsInquiryFormPage';
import CsInquiryHistoryPage from './pages/cs/CsInquiryHistoryPage';
import CsInquiryDetailPage from './pages/cs/CsInquiryDetailPage';

// 관리자 전용 페이지
import UserManagementPage from './pages/admin/UserManagementPage';
import ReportManagementPage from './pages/admin/ReportManagementPage';
import ReportDetailPage from './pages/admin/ReportDetailPage';
import AdminFaqListPage from './pages/admin/AdminFaqListPage';
import AdminFaqFormPage from './pages/admin/AdminFaqFormPage';
import AdminInquiryListPage from './pages/admin/AdminInquiryListpage';
import AdminInquiryDetailPage from './pages/admin/AdminInquiryDetailPage';

function App() {

  return (
    <AuthGate>
      <Header />
      <section id="content">
        <Routes>
          {/* --- 1. 공개 경로 (로그인 없이 접근 가능) --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} /> {/* ProtectedRoute 제거 */}
          
          <Route path="/cs-center" element={<CustomerServicePage />} />
          <Route path="/faqs" element={<FaqListPage />} />
          <Route path="/faqs/:faqId" element={<FaqDetailPage />} />

          {/* --- 2. 보호된 경로 (로그인 필수) --- */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          } />
          
          <Route path="/cs-inquiry" element={
            <ProtectedRoute>
              <CsInquiryFormPage />
            </ProtectedRoute>
          } />
          <Route path="/cs-history" element={
            <ProtectedRoute>
              <CsInquiryHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/cs-history/:inquiryId" element={
            <ProtectedRoute>
              <CsInquiryDetailPage />
            </ProtectedRoute>
          } />

          {/* --- 3. 관리자 전용 경로 (ADMIN 권한 필수) --- */}
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          } />
          {/* ... 나머지 관리자 페이지들도 동일하게 ProtectedRoute로 감싸줍니다 ... */}
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <ReportManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/:reportId" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <ReportDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/faqs" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <AdminFaqListPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/faqs/new" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <AdminFaqFormPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/faqs/edit/:faqId" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <AdminFaqFormPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/inquiries" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <AdminInquiryListPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/inquiries/:inquiryId" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
              <AdminInquiryDetailPage />
            </ProtectedRoute>
          } />
        </Routes>
      </section>
    </AuthGate>
  );
}

export default App;