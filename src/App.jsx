import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { registerSW } from 'virtual:pwa-register'
import Home from './components/Home'
import Login from './components/Login'
import Events from './components/Events'
import Profile from './components/Profile'
import Navigation from './components/Navigation'

function App() {
  const { user, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
    
    // Register service worker
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
          updateSW(true)
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline')
      },
    })
  }, [])

  return (
    <Router>
      <div className="app">
        {user && <Navigation />}
        <main className="container">
          <Routes>
            <Route path="/" element={user ? <Events /> : <Home />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App