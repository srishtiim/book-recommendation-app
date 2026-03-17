import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createContext, useContext, useState } from 'react'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Entry from './pages/Entry'
import Library from './pages/Library'
import Tracker from './pages/Tracker'

export const LightsContext = createContext({ lightsOn: true, toggleLights: () => {} })
export const useLights = () => useContext(LightsContext)

export function getUser() {
  try { return JSON.parse(localStorage.getItem('ashveil_user')) } catch { return null }
}
export function setUser(u) {
  if (u) localStorage.setItem('ashveil_user', JSON.stringify(u))
  else localStorage.removeItem('ashveil_user')
}

function ProtectedRoute({ children }) {
  return getUser() ? children : <Navigate to="/" replace />
}
function PublicRoute({ children }) {
  return getUser() ? <Navigate to="/library" replace /> : children
}

export default function App() {
  const [lightsOn, setLightsOn] = useState(true)
  const toggleLights = () => setLightsOn(v => !v)

  return (
    <LightsContext.Provider value={{ lightsOn, toggleLights }}>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login"   element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/entry"   element={<Entry />} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LightsContext.Provider>
  )
}
