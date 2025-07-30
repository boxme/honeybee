import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const eventsService = {
  async getEvents() {
    const response = await api.get('/events')
    return response.data
  },

  async createEvent(eventData) {
    const response = await api.post('/events', eventData)
    return response.data
  },

  async updateEvent(eventId, updates) {
    const response = await api.put(`/events/${eventId}`, updates)
    return response.data
  },

  async deleteEvent(eventId) {
    await api.delete(`/events/${eventId}`)
  },

  async syncEvents(events) {
    const response = await api.post('/events/sync', { events })
    return response.data
  }
}