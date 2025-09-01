import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Link, Route, Router, Routes } from 'react-router-dom'
import TodayGame from './pages/balGame/TodayGame'

function Home() {
  return (
    <div>
      <h1>메인 화면</h1>
      <Link to="/balgame">오늘의 밸런스 게임 보러가기</Link>
    </div>
  )
}

function App() {
  return (
    
      <Routes>
        {/* 첫 화면 */}
        <Route path="/" element={<Home />} />

        {/* 오늘의 게임 */}
        <Route path="/balgame" element={<TodayGame />} />
      </Routes>
    
  )
}

export default App
