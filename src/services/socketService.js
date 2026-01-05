import { io } from 'socket.io-client'
import { useEventsStore } from '../stores/eventsStore'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token, userId, partnerId) {
    if (this.socket?.connected) {
      return
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || ''
    
    this.socket = io(serverUrl, {
      auth: {
        token
      }
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
      
      if (partnerId) {
        this.socket.emit('join_partner_room', partnerId)
      }
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
    })

    this.socket.on('new_event', (eventData) => {
      console.log('New event from partner:', eventData)
      // Refresh events to include the new one
      useEventsStore.getState().loadEvents()
    })

    this.socket.on('event_updated', (eventData) => {
      console.log('Event updated by partner:', eventData)
      // Refresh events to show updates
      useEventsStore.getState().loadEvents()
    })

    this.socket.on('event_deleted', (eventData) => {
      console.log('Event deleted by partner:', eventData)
      // Refresh events to remove deleted one
      useEventsStore.getState().loadEvents()
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emitEventCreated(eventData, partnerId) {
    if (this.socket?.connected && partnerId) {
      this.socket.emit('event_created', {
        ...eventData,
        partnerId
      })
    }
  }

  emitEventUpdated(eventData, partnerId) {
    if (this.socket?.connected && partnerId) {
      this.socket.emit('event_updated', {
        ...eventData,
        partnerId
      })
    }
  }

  emitEventDeleted(eventData, partnerId) {
    if (this.socket?.connected && partnerId) {
      this.socket.emit('event_deleted', {
        ...eventData,
        partnerId
      })
    }
  }
}

export const socketService = new SocketService()