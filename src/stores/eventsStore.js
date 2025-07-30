import { create } from 'zustand'
import { dbService } from '../services/dbService'
import { eventsService } from '../services/eventsService'

export const useEventsStore = create((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  loadEvents: async () => {
    set({ isLoading: true, error: null })
    try {
      // Load from local database first
      const localEvents = await dbService.getEvents()
      set({ events: localEvents, isLoading: false })

      // Then try to sync with remote
      try {
        const remoteEvents = await eventsService.getEvents()
        // Merge local and remote events, preferring remote data
        const mergedEvents = mergeEvents(localEvents, remoteEvents)
        set({ events: mergedEvents })
      } catch (syncError) {
        console.log('Offline mode: using local data only')
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  createEvent: async (eventData) => {
    try {
      // Save to local database first
      const localEvent = await dbService.createEvent(eventData)
      
      // Update local state
      const currentEvents = get().events
      set({ events: [...currentEvents, localEvent] })

      // Try to sync with remote
      try {
        const remoteEvent = await eventsService.createEvent(eventData)
        await dbService.markAsSynced(localEvent.id, remoteEvent.id)
        
        // Update with remote data
        const updatedEvents = currentEvents.map(e => 
          e.id === localEvent.id ? { ...remoteEvent, synced: 1 } : e
        )
        set({ events: [...updatedEvents.filter(e => e.id !== localEvent.id), remoteEvent] })
      } catch (syncError) {
        console.log('Event saved locally, will sync when online')
      }
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateEvent: async (eventId, updates) => {
    try {
      // Update local database
      await dbService.updateEvent(eventId, updates)
      
      // Update local state
      const currentEvents = get().events
      const updatedEvents = currentEvents.map(event =>
        event.id === eventId ? { ...event, ...updates } : event
      )
      set({ events: updatedEvents })

      // Try to sync with remote
      try {
        const event = updatedEvents.find(e => e.id === eventId)
        if (event?.remote_id) {
          await eventsService.updateEvent(event.remote_id, updates)
        }
      } catch (syncError) {
        console.log('Event updated locally, will sync when online')
      }
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteEvent: async (eventId) => {
    try {
      // Delete from local database
      await dbService.deleteEvent(eventId)
      
      // Update local state
      const currentEvents = get().events
      const event = currentEvents.find(e => e.id === eventId)
      const filteredEvents = currentEvents.filter(e => e.id !== eventId)
      set({ events: filteredEvents })

      // Try to sync with remote
      try {
        if (event?.remote_id) {
          await eventsService.deleteEvent(event.remote_id)
        }
      } catch (syncError) {
        console.log('Event deleted locally, will sync when online')
      }
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  syncEvents: async () => {
    try {
      const unsyncedEvents = await dbService.getUnsyncedEvents()
      
      if (unsyncedEvents.length > 0) {
        const syncResult = await eventsService.syncEvents(unsyncedEvents)
        
        // Update local database with remote IDs
        for (const syncedEvent of syncResult.syncedEvents) {
          await dbService.markAsSynced(syncedEvent.localId, syncedEvent.remoteId)
        }
        
        // Reload events
        get().loadEvents()
      }
    } catch (error) {
      console.log('Sync failed:', error)
    }
  },

  clearError: () => set({ error: null })
}))

// Helper function to merge local and remote events
function mergeEvents(localEvents, remoteEvents) {
  const eventMap = new Map()
  
  // Add local events
  localEvents.forEach(event => {
    eventMap.set(event.remote_id || `local_${event.id}`, event)
  })
  
  // Add/update with remote events (they take precedence)
  remoteEvents.forEach(event => {
    eventMap.set(event.id, { ...event, synced: 1 })
  })
  
  return Array.from(eventMap.values()).sort((a, b) => {
    const dateA = new Date(a.date + (a.time ? ` ${a.time}` : ''))
    const dateB = new Date(b.date + (b.time ? ` ${b.time}` : ''))
    return dateA - dateB
  })
}