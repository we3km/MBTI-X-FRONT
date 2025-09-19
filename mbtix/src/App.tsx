import './App.css'
import { Route, Routes } from 'react-router-dom'
import SignupPage from './pages/login/SignupPage'
import LoginPage from './pages/login/Login'
import AuthGate from './components/AuthGate';
import ReactionTest from './pages/mini-game/reaction-test/ReactionTest';
import SpeedQuiz from './pages/mini-game/speed-quiz/SpeedQuiz';
import GameRank from './pages/mini-game/Ranking';
import OnlineGame from './pages/mini-game/online-game/OnlineGame';
import CatchMind from './pages/mini-game/online-game/CatchMind';
import MBTIGraph from './pages/MBTIGraph/MBTIGraph';
import Home from './pages/mainpage';
import OAuth2Success from './pages/login/OAuth2Success';
import SocialSignup from './pages/login/socialSignup';
import Findid from './pages/login/FindId';
import Findpw from './pages/login/Findpw';
import SignupComplete from './pages/login/SignupComplete';
import GameMenu from './pages/mini-game/GameMenu';
import AdminQuizSubmit from './pages/mini-game/admin-game/AdminQuizSubmit';

function App() {
  return (
    <AuthGate>
      {/* <Header /> */}
      <section id="content">
        <Routes>
          <Route path="/" element={<Home />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="find-pw" element={<Findpw />} />
          <Route path="/find-id" element={<Findid />} />

          <Route path="/signup" element={<SignupPage />} />

          <Route path="/miniGame">
            <Route index element={<GameMenu />} />
            <Route path="OnlineGame" element={<OnlineGame />} />
            <Route path="SpeedQuiz" element={<SpeedQuiz />} />
            <Route path="ReactionTest" element={<ReactionTest />} />
            <Route path="GameRank" element={<GameRank />} />
            <Route path="AdminQuizSubmit" element={<AdminQuizSubmit />} />
            <Route path="CatchMind/:roomId" element={<CatchMind />} />
          </Route>

          <Route path="/MBTIGraph" element={<MBTIGraph />} />
          <Route path='/oauth2/success' element={<OAuth2Success />} />
          <Route path='/social-signup' element={<SocialSignup />} />
          <Route path="/signup-complete" element={<SignupComplete />} />
        </Routes>
      </section>
    </AuthGate>
  );
}
export default App