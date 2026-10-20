import { useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import EntryGate from './components/EntryGate'
import QuizPage from './pages/QuizPage'
import MemoriesPage from './pages/MemoriesPage'
import Admin from './Admin.jsx'

const ENTRY_KEY = 'kq:entry-unlocked:v1'

function RoutedApp() {
  const location = useLocation()
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return window.sessionStorage.getItem(ENTRY_KEY) === 'yes'
    } catch {
      return false
    }
  })
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin')

  if (!isAdminRoute && !unlocked) {
    return <EntryGate onSuccess={() => setUnlocked(true)} />
  }

  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={<QuizPage />} />
      <Route path="/memories" element={<MemoriesPage />} />
      <Route path="*" element={<QuizPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  )
}