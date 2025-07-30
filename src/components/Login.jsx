import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login, register: registerUser, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      if (isLogin) {
        await login(data)
      } else {
        await registerUser(data)
      }
      navigate('/events')
    } catch (err) {
      console.error('Auth error:', err)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="form-input"
                placeholder="Your name"
              />
              {errors.name && <span className="error">{errors.name.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="form-input"
              placeholder="your@email.com"
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              type="password"
              className="form-input"
              placeholder="Password"
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary full-width"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-switch">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="link-button"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
          padding: 20px;
        }
        
        .auth-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        
        .auth-card h2 {
          text-align: center;
          margin-bottom: 24px;
          color: #333;
        }
        
        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          text-align: center;
        }
        
        .error {
          color: #c33;
          font-size: 14px;
          margin-top: 4px;
          display: block;
        }
        
        .full-width {
          width: 100%;
        }
        
        .auth-switch {
          text-align: center;
          margin-top: 24px;
        }
        
        .link-button {
          background: none;
          border: none;
          color: #FFB000;
          cursor: pointer;
          text-decoration: underline;
          font-size: 14px;
        }
        
        .link-button:hover {
          color: #E69A00;
        }
      `}</style>
    </div>
  )
}

export default Login