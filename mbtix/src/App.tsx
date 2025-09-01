import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import SignupPage from './pages/login/SignupPage'

function App() {

  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </>
  )
}

export default App
