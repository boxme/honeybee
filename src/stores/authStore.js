import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      partner: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const result = await authService.login(credentials)
          set({ 
            user: result.user, 
            partner: result.partner,
            isLoading: false 
          })
          return result
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const result = await authService.register(userData)
          set({ 
            user: result.user, 
            partner: result.partner,
            isLoading: false 
          })
          return result
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      pairWithPartner: async (partnerCode) => {
        set({ isLoading: true, error: null })
        try {
          const partner = await authService.pairWithPartner(partnerCode)
          set({ partner, isLoading: false })
          return partner
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, partner: null, error: null })
        authService.logout()
      },

      initializeAuth: async () => {
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const user = await authService.getCurrentUser()
            set({ user: user.user, partner: user.partner })
          } catch (error) {
            localStorage.removeItem('token')
            set({ user: null, partner: null })
          }
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, partner: state.partner })
    }
  )
)