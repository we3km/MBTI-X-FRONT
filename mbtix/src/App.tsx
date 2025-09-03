import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import List from './pages/board/List'
import Insert from './pages/board/Insert'
import Detail from './pages/board/Detail'
import Question from './pages/board/question'
import Mbti from './pages/board/Mbti'

function App() {
  /* 
    5173/board => 게시글 목록
    5173/board/new => 게시글 등록
    5173/board/1 => 1번게시글 상세보기
    5173/board/2 => 2번게시글 상세보기
  */
  return (
    <>
      <Routes>
        <Route path='/board'  >
          <Route path='' element={<List/>}/>
          <Route path='new' element={<Insert/>} />
          <Route path=':id' element={<Detail/>}/>
        </Route>
        <Route path="/question">
          <Route path='' element={<Question/>}/>
        </Route>
        <Route path="/Mbti">
          <Route path='' element={<Mbti/>}/>
        </Route>

      </Routes>
    </>
  )
}

export default App
