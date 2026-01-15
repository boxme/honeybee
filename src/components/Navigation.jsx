import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function Navigation() {
  const location = useLocation()
  const { logout } = useAuthStore()

  return (
    <nav className="navigation">
      <div className="nav-container">
        <span className="nav-brand">
          🐝 Honeybee
        </span>
        
        <div className="nav-links">
          <Link
            to="/events"
            replace
            className={`nav-link ${location.pathname === '/events' || location.pathname === '/' ? 'active' : ''}`}
          >
            📅 Events
          </Link>
          <Link
            to="/profile"
            replace
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            👤 Profile
          </Link>
          <button onClick={logout} className="nav-link logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .navigation {
          background: white;
          border-bottom: 1px solid #eee;
          padding: 12px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .nav-container {
          max-width: 768px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-brand {
          font-size: 1.25rem;
          font-weight: bold;
          color: #FFB000;
          text-decoration: none;
        }
        
        .nav-links {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        
        .nav-link {
          color: #666;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        .nav-link:hover {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .nav-link.active {
          background-color: #FFB000;
          color: white;
        }
        
        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
        }
        
        .logout-btn:hover {
          background-color: #fee;
          color: #c33;
        }
        
        @media (max-width: 768px) {
          .nav-container {
            padding: 0 16px;
          }
          
          .nav-links {
            gap: 8px;
          }
          
          .nav-link {
            padding: 6px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </nav>
  )
}

export default Navigation