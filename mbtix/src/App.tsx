import './App.css'
import { Route, Routes } from 'react-router-dom'
import MbtiChat from './pages/mbti-chat/mbtiChat'
import CreateChat from './pages/mbti-chat/createChat'


function App() {

  return (
    <>
      {/* <MbtiChat/> */}
      <Routes>
        <Route path='/chat' element={<MbtiChat />}/>
        <Route path='/createChat' element={<CreateChat/>}/>
        <Route path="/chat/:mbti" element={<MbtiChat />} />
      </Routes>
    </>
  )
}

export default App
