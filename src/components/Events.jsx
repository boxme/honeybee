import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { format, parseISO } from 'date-fns'
import { useEventsStore } from '../stores/eventsStore'
import { useAuthStore } from '../stores/authStore'
import EventCard from './EventCard'

function Events() {
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()
  
  const { events, isLoading, createEvent, updateEvent, deleteEvent, loadEvents } = useEventsStore()
  const { user } = useAuthStore()

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const onSubmit = async (data) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data)
        setEditingEvent(null)
      } else {
        await createEvent({
          ...data,
          created_by: user.id
        })
      }
      reset()
      setShowForm(false)
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setValue('title', event.title)
    setValue('description', event.description || '')
    setValue('date', event.date)
    setValue('time', event.time || '')
    setValue('location', event.location || '')
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
    reset()
  }

  if (isLoading) {
    return <div className="loading">Loading events...</div>
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>📅 Your Events</h1>
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

              <div className="form-row">
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
                  <label className="form-label">Time</label>
                  <input
                    {...register('time')}
                    type="time"
                    className="form-input"
                  />
                </div>
              </div>

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