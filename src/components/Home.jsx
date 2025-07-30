import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>🐝 Honeybee Events</h1>
        <p>Share your planned events and activities with your partner</p>
        <div className="cta-buttons">
          <Link to="/auth" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
      
      <div className="features">
        <div className="card">
          <h3>📱 Works Offline</h3>
          <p>Access your events even without internet connection</p>
        </div>
        
        <div className="card">
          <h3>🔄 Real-time Sync</h3>
          <p>See your partner's events instantly as they add them</p>
        </div>
        
        <div className="card">
          <h3>📅 Shared Calendar</h3>
          <p>Plan activities together with a shared event calendar</p>
        </div>
      </div>
      
      <style jsx>{`
        .home {
          padding: 20px 0;
        }
        
        .hero {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .hero h1 {
          font-size: 3rem;
          margin-bottom: 16px;
          color: #333;
        }
        
        .hero p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 32px;
        }
        
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        
        .features .card {
          text-align: center;
        }
        
        .features h3 {
          font-size: 1.5rem;
          margin-bottom: 12px;
          color: #333;
        }
        
        .features p {
          color: #666;
          line-height: 1.5;
        }
        
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }
          
          .features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Home