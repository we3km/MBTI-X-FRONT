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
import { useDispatch } from 'react-redux';
import { authApi } from './api/authApi';
import { setAuth } from './features/authSlice';
import AuthGate from './components/AuthGate';
// import GameMenu from './pages/mini-game/GameMenu';
// import ReactionTest from './pages/mini-game/reaction-test/ReactionTest';
// import SpeedQuiz from './pages/mini-game/speed-quiz/SpeedQuiz';
// import GameRank from './pages/mini-game/Ranking';
import MBTIGraph from './pages/MBTIGraph/MBTIGraph';
import Home from './pages/mainpage';
import OAuth2Success from './pages/login/OAuth2Success';
import SocialSignup from './pages/login/socialSignup';
import Findid from './pages/login/FindId';
import Findpw from './pages/login/Findpw';
import SignupComplete from './pages/login/SignupComplete';
function App() {

    /* 
    5173/board => 게시글 목록
    5173/board/new => 게시글 등록
    5173/board/1 => 1번게시글 상세보기
    5173/board/2 => 2번게시글 상세보기
  */
return (
  <AuthGate>
    {/* <Header /> */}
    <section id="content">
      <Routes>
        <Route path="/" element={<Home />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="find-pw" element={<Findpw />} />
        <Route path="/find-id" element={<Findid/>} />

        <Route path="/signup" element={<SignupPage />} />
        {/* <Route path="/miniGame" element={<GameMenu />} />
        <Route path="/miniGame/SpeedQuiz" element={<SpeedQuiz />} />
        <Route path="/miniGame/ReactionTest" element={<ReactionTest />} />
        <Route path="/miniGame/GameRank" element={<GameRank />} /> */}
        <Route path="/MBTIGraph" element={<MBTIGraph />} />
        <Route path='/oauth2/success' element={<OAuth2Success/>}/>
        <Route path='/social-signup' element={<SocialSignup/>}/>
        <Route path="/signup-complete" element={<SignupComplete />} />

        <Route path='/board'  >
          <Route path='' element={
            <ProtectedRoute>
                <List/>
            </ProtectedRoute>}/>
          <Route path='new' element={
            <ProtectedRoute>
              <Insert/>
            </ProtectedRoute>
            } />
          <Route path=':id' element={
            <ProtectedRoute>
              <Detail/>
            </ProtectedRoute>}/>
        </Route>
        <Route path="/question">
          <Route path='' element={
            <ProtectedRoute>        
              <Question/>
            </ProtectedRoute>}/>
        </Route>
        <Route path="/mbti">
          <Route path=':id' element={
            <ProtectedRoute>  
              <Mbti/>
            </ProtectedRoute>}/>
        </Route>

      </Routes>
    </section>
  </AuthGate>
);

}
export default App