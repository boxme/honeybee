import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { format, parseISO } from 'date-fns'
import { useEventsStore } from '../stores/eventsStore'
import { useAuthStore } from '../stores/authStore'
import EventCard from './EventCard'

function Events() {
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAllDay, setIsAllDay] = useState(true)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  const { events, isLoading, createEvent, updateEvent, deleteEvent, loadEvents } = useEventsStore()
  const { user } = useAuthStore()

  const containerRef = useRef(null)
  const PULL_THRESHOLD = 80

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Pull-to-refresh touch handlers with non-passive listeners for iOS
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let startY = 0
    let currentPull = 0

    const onTouchStart = (e) => {
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY
      }
    }

    const onTouchMove = (e) => {
      if (isRefreshing || startY === 0) return

      if (container.scrollTop > 0) {
        currentPull = 0
        setPullDistance(0)
        return
      }

      const touchY = e.touches[0].clientY
      const distance = touchY - startY

      if (distance > 0) {
        e.preventDefault()
        currentPull = Math.min(distance * 0.5, 120)
        setPullDistance(currentPull)
      }
    }

    const onTouchEnd = async () => {
      if (currentPull >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true)
        setPullDistance(PULL_THRESHOLD)
        await loadEvents()
        setIsRefreshing(false)
      }
      setPullDistance(0)
      startY = 0
      currentPull = 0
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [isRefreshing, loadEvents])

  const onSubmit = async (data) => {
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        start_time: isAllDay ? null : data.start_time,
        end_time: isAllDay ? null : data.end_time,
        location: data.location
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
        setEditingEvent(null)
      } else {
        await createEvent({
          ...eventData,
          created_by: user.id
        })
      }
      reset()
      setIsAllDay(true)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setValue('title', event.title)
    setValue('description', event.description || '')
    setValue('date', format(parseISO(event.date), 'yyyy-MM-dd'))
    setValue('start_time', event.start_time || '')
    setValue('end_time', event.end_time || '')
    setValue('location', event.location || '')
    setIsAllDay(!event.start_time && !event.end_time)
    setShowForm(true)
  }

  const handleDelete = async (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
    setIsAllDay(true)
    reset()
  }

  if (isLoading) {
    return <div className="loading">Loading events...</div>
  }

  return (
    <div className="events-container" ref={containerRef}>
      <div
        className="pull-indicator"
        style={{
          height: pullDistance,
          opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
        }}
      >
        <div className={`pull-spinner ${isRefreshing ? 'spinning' : ''}`}>
          {isRefreshing ? '...' : '↓'}
        </div>
        <span>{isRefreshing ? 'Refreshing...' : pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}</span>
      </div>

      <div className="events-header">
        <h1>Your Events</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          + Add Event
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingEvent ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={handleCancel} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="form-input"
                  placeholder="Event title"
                />
                {errors.title && <span className="error">{errors.title.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  {...register('description')}
                  className="form-input"
                  placeholder="Event description (optional)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className="form-input"
                />
                {errors.date && <span className="error">{errors.date.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label toggle-label">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-text">All day</span>
                </label>
              </div>

              {!isAllDay && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start time</label>
                    <input
                      {...register('start_time', {
                        required: !isAllDay ? 'Start time is required' : false
                      })}
                      type="time"
                      className="form-input"
                    />
                    {errors.start_time && <span className="error">{errors.start_time.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">End time</label>
                    <input
                      {...register('end_time', {
                        required: !isAllDay ? 'End time is required' : false,
                        validate: (value) => {
                          if (isAllDay) return true
                          if (!startTime || !value) return true
                          return value > startTime || 'End time must be after start time'
                        }
                      })}
                      type="time"
                      className="form-input"
                    />
                    {errors.end_time && <span className="error">{errors.end_time.message}</span>}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  {...register('location')}
                  className="form-input"
                  placeholder="Event location (optional)"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="events-list">
        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No events yet</h3>
            <p>Create your first event to get started!</p>
          </div>
        ) : (
          events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              currentUserId={user.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .events-container {
          padding: 20px 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .pull-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: #666;
          font-size: 14px;
          gap: 4px;
          transition: opacity 0.2s ease;
        }

        .pull-spinner {
          font-size: 20px;
          transition: transform 0.2s ease;
        }

        .pull-spinner.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .events-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .events-header h1 {
          margin: 0;
          color: #333;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal {
          background: white;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .modal-header h3 {
          margin: 0;
          color: #333;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-btn:hover {
          color: #333;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }
        
        .error {
          color: #c33;
          font-size: 14px;
          margin-top: 4px;
          display: block;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        
        .empty-state h3 {
          margin-bottom: 8px;
          color: #333;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .toggle-checkbox {
          width: 18px;
          height: 18px;
          margin-right: 8px;
          accent-color: #FFB000;
        }

        .toggle-text {
          font-size: 14px;
          color: #333;
        }

        @media (max-width: 768px) {
          .events-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .form-row {
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

export default Events