import React from 'react'
import { format, parseISO } from 'date-fns'

function EventCard({ event, currentUserId, onEdit, onDelete }) {
  const eventDate = parseISO(event.date)

  return (
    <div className="event-card">
      <div className="event-header">
        <div className="event-date">
          <div className="date-day">{format(eventDate, 'dd')}</div>
          <div className="date-month">{format(eventDate, 'MMM')}</div>
        </div>

        <div className="event-info">
          <h3>{event.title}</h3>
          <div className="event-time">
            {event.start_time && event.end_time
              ? `🕒 ${event.start_time} - ${event.end_time}`
              : '🕒 All day'}
          </div>
          {event.location && (
            <div className="event-location">📍 {event.location}</div>
          )}
          <div className="event-creator">
            Created by {event.created_by_name || 'You'}
          </div>
        </div>

        <div className="event-actions">
          <button onClick={() => onEdit(event)} className="edit-btn">
            ✏️
          </button>
          <button onClick={() => onDelete(event.id)} className="delete-btn">
            🗑️
          </button>
        </div>
      </div>
      
      {event.description && (
        <div className="event-description">
          {event.description}
        </div>
      )}
      
      <style jsx>{`
        .event-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 16px;
          border-left: 4px solid #FFB000;
        }
        
        .event-header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        
        .event-date {
          background: #FFB000;
          color: white;
          border-radius: 8px;
          padding: 8px;
          text-align: center;
          min-width: 60px;
          flex-shrink: 0;
        }
        
        .date-day {
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 1;
        }
        
        .date-month {
          font-size: 0.875rem;
          opacity: 0.9;
        }
        
        .event-info {
          flex: 1;
        }
        
        .event-info h3 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 1.25rem;
        }
        
        .event-time,
        .event-location,
        .event-creator {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 4px;
        }
        
        .event-creator {
          font-style: italic;
          margin-top: 8px;
        }
        
        .event-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        
        .edit-btn,
        .delete-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s ease;
        }
        
        .edit-btn:hover {
          background-color: #f0f0f0;
        }
        
        .delete-btn:hover {
          background-color: #ffe6e6;
        }
        
        .event-description {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          color: #555;
          line-height: 1.5;
        }
        
        @media (max-width: 768px) {
          .event-header {
            flex-direction: column;
            gap: 12px;
          }
          
          .event-date {
            align-self: flex-start;
          }
          
          .event-actions {
            align-self: flex-end;
            margin-top: -40px;
          }
        }
      `}</style>
    </div>
  )
}

export default EventCard