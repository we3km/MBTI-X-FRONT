import './App.css'
import { Route, Routes } from 'react-router-dom'
import SignupPage from './pages/login/SignupPage'
import LoginPage from './pages/login/Login'
import ProtectedRoute from './components/ProtectedRoute';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
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
function App() {
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   authApi.post("/refresh")
  //     .then(res => {
  //       dispatch(setAuth(res.data));
  //     })
  // })
  return (
    <AuthGate>
      {/* <Header /> */}
      <section id="content">
        <Routes>
          <Route path="/" element={<Home />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* <Route path="/miniGame" element={<GameMenu />} />
          <Route path="/miniGame/SpeedQuiz" element={<SpeedQuiz />} />
          <Route path="/miniGame/ReactionTest" element={<ReactionTest />} />
          <Route path="/miniGame/GameRank" element={<GameRank />} /> */}
          <Route path="/MBTIGraph" element={<MBTIGraph />} />
          <Route path='/oauth2/success' element={<OAuth2Success/>}/>
          <Route path='/social-signup' element={<SocialSignup/>}/>
        </Routes>
      </section>
    </AuthGate>
  );
}
export default App