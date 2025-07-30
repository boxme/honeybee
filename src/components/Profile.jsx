import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'

function Profile() {
  const [showPairForm, setShowPairForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { user, partner, pairWithPartner, isLoading, error, clearError } = useAuthStore()

  const onSubmit = async (data) => {
    try {
      await pairWithPartner(data.partnerCode)
      reset()
      setShowPairForm(false)
    } catch (err) {
      console.error('Pairing error:', err)
    }
  }

  const copyUserCode = () => {
    navigator.clipboard.writeText(user.userCode)
    alert('User code copied to clipboard!')
  }

  return (
    <div className="profile-container">
      <h1>👤 Profile</h1>
      
      <div className="card">
        <h3>Your Information</h3>
        <div className="info-row">
          <strong>Name:</strong> {user.name}
        </div>
        <div className="info-row">
          <strong>Email:</strong> {user.email}
        </div>
        <div className="info-row">
          <strong>Your Code:</strong> 
          <span className="user-code" onClick={copyUserCode}>
            {user.userCode} 📋
          </span>
        </div>
        <p className="help-text">
          Share your code with your partner so they can connect with you
        </p>
      </div>

      <div className="card">
        <h3>Partner</h3>
        {partner ? (
          <div>
            <div className="info-row">
              <strong>Partner:</strong> {partner.name}
            </div>
            <div className="info-row">
              <strong>Email:</strong> {partner.email}
            </div>
            <div className="partner-status">
              ✅ Connected! You can now share events with each other.
            </div>
          </div>
        ) : (
          <div>
            <p>No partner connected yet.</p>
            {!showPairForm ? (
              <button 
                onClick={() => setShowPairForm(true)}
                className="btn btn-primary"
              >
                Connect with Partner
              </button>
            ) : (
              <div className="pair-form">
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <label className="form-label">Partner's Code</label>
                    <input
                      {...register('partnerCode', { 
                        required: 'Partner code is required',
                        minLength: {
                          value: 6,
                          message: 'Partner code must be 6 characters'
                        },
                        maxLength: {
                          value: 6,
                          message: 'Partner code must be 6 characters'
                        }
                      })}
                      className="form-input"
                      placeholder="Enter 6-character code"
                      maxLength="6"
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.partnerCode && (
                      <span className="error">{errors.partnerCode.message}</span>
                    )}
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowPairForm(false)
                        clearError()
                        reset()
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3>About Honeybee</h3>
        <p>
          Honeybee helps couples stay connected by sharing their planned events and activities. 
          Your events are stored locally on your device and synced with the cloud when you're online.
        </p>
        <div className="features-list">
          <div className="feature">📱 Works offline</div>
          <div className="feature">🔄 Real-time sync</div>
          <div className="feature">📅 Shared calendar</div>
          <div className="feature">🔒 Secure & private</div>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          padding: 20px 0;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .profile-container h1 {
          margin-bottom: 24px;
          color: #333;
        }
        
        .info-row {
          margin-bottom: 12px;
          display: flex;
          gap: 8px;
        }
        
        .user-code {
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          cursor: pointer;
          margin-left: 8px;
          font-weight: bold;
          color: #FFB000;
        }
        
        .user-code:hover {
          background: #e9ecef;
        }
        
        .help-text {
          font-size: 14px;
          color: #666;
          margin-top: 12px;
          font-style: italic;
        }
        
        .partner-status {
          background: #d4edda;
          color: #155724;
          padding: 12px;
          border-radius: 8px;
          margin-top: 12px;
          font-weight: 500;
        }
        
        .pair-form {
          margin-top: 16px;
        }
        
        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          text-align: center;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        
        .error {
          color: #c33;
          font-size: 14px;
          margin-top: 4px;
          display: block;
        }
        
        .features-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }
        
        .feature {
          font-size: 14px;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .features-list {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column-reverse;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile