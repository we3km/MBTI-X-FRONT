import './App.css'

import { Navigate, Route, Routes } from 'react-router-dom'

import './App.css';

import AuthGate from './components/AuthGate';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/login/Login';
import SignupPage from './pages/login/SignupPage';
import MBTIGraph from './pages/MBTIGraph/MBTIGraph';
import OAuth2Success from './pages/login/OAuth2Success';
import SocialSignup from './pages/login/socialSignup';
import Findid from './pages/login/FindId';
import Findpw from './pages/login/Findpw';
import SignupComplete from './pages/login/SignupComplete';
import MyPage from './pages/myPage/MyPage';

import TodayGame from './pages/balGame/TodayGame';
import BalanceList from './pages/balGame/BalanceList';
import PastBalance from './pages/balGame/PastBalance';
import BalanceCreate from './pages/balGame/CreateBalGame';
import MbtiTest from './pages/mbtiTest/MbtiTest';
import MbtiResult from './pages/mbtiTest/MbtiResult';

// import GameMenu from './pages/mini-game/GameMenu';
// import ReactionTest from './pages/mini-game/reaction-test/ReactionTest';
// import SpeedQuiz from './pages/mini-game/speed-quiz/SpeedQuiz';
// import GameRank from './pages/mini-game/Ranking';


// 모든 페이지 컴포넌트 import
import CustomerServicePage from './pages/faq/CustomerServicePage';
import FaqListPage from './pages/faq/FaqListPage';
import FaqDetailPage from './pages/faq/FaqDetailPage';
import MainPage from './pages/mainpage';
import CsInquiryFormPage from './pages/cs/CsInquiryFormPage';
import CsInquiryHistoryPage from './pages/cs/CsInquiryHistoryPage';
import CsInquiryDetailPage from './pages/cs/CsInquiryDetailPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ReportManagementPage from './pages/admin/ReportManagementPage';
import ReportDetailPage from './pages/admin/ReportDetailPage';
import AdminFaqListPage from './pages/admin/AdminFaqListPage';
import AdminFaqFormPage from './pages/admin/AdminFaqFormPage';
import AdminInquiryListPage from './pages/admin/AdminInquiryListpage';
import AdminInquiryDetailPage from './pages/admin/AdminInquiryDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import LayoutWithHeader from './components/LayoutWithHeader';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';


function App() {
  return (
    <AuthGate>
      <section id="content">
        {/* 헤더없어요 */}
        {/* --- 공개 경로 --- */}
          <Routes>
          <Route path="/" element={<MainPage />}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="find-pw" element={<Findpw />} />
          <Route path="/find-id" element={<Findid/>} />
          <Route path='/oauth2/success' element={<OAuth2Success/>}/>
          <Route path='/social-signup' element={<SocialSignup/>}/>
          <Route path="/signup-complete" element={<SignupComplete />} />
          <Route path="/cs-center" element={<CustomerServicePage />} />
          <Route path="/faqs" element={<FaqListPage />} />
          <Route path="/faqs/:faqId" element={<FaqDetailPage />} />
          {/* --- 로그인 필수 경로 --- */}

          {/* 헤더 있어요 */}
          <Route element={<LayoutWithHeader />}>
          <Route path="/cs-inquiry" element={<ProtectedRoute><CsInquiryFormPage /></ProtectedRoute>} />
          <Route path="/cs-history" element={<ProtectedRoute><CsInquiryHistoryPage /></ProtectedRoute>} />
          <Route path="/cs-history/:inquiryId" element={<ProtectedRoute><CsInquiryDetailPage /></ProtectedRoute>} />

          {/* --- 관리자 전용 경로 --- */}
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

          {/* --- 로그인 관련 경로 --- */}
          <Route path="/MBTIGraph" element={<MBTIGraph />} />
          <Route path='/mypage' element={<ProtectedRoute><MyPage/></ProtectedRoute>}/>
          <Route path="/balance/today" element={<TodayGame />} />
          <Route path="/balanceList" element={<BalanceList />} />
          <Route path="/balance/:gameId" element={<PastBalance />} />
          <Route path="/balance/new" element={<BalanceCreate />} />
          <Route path="/MbtiTest" element={useSelector((state: RootState) => state.auth.retestAllowed)? <MbtiTest />: <Navigate to="/" replace />}/>
          <Route path="/MbtiResult" element={<MbtiResult />} />
          </Route>         
        </Routes>
      </section>
    </AuthGate>
  );
}
export default App
