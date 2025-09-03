import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import GameMenu from './pages/mini-game/GameMenu'
import ReactionTest from './pages/mini-game/reaction-test/ReactionTest'
import GameTest from './mini-game/test/game-test'
import SpeedQuiz from './pages/mini-game/speed-quiz/SpeedQuiz'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import GameRank from './pages/mini-game/Ranking'

// ReactionTest 컴포넌트 불러오기

const queryClient = new QueryClient();

function MiniGame() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GameMenu />} />
            <Route path="/GameRank" element={<GameRank />} />
            <Route path="/ReactionTest" element={<ReactionTest />} />
            <Route path="/SpeedQuiz" element={<SpeedQuiz />} />
            <Route path="/GameTest" element={<GameTest />} />
          </Routes>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  )
}

export default MiniGame