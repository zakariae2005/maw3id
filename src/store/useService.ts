import { Service, ServicePayload } from '@/types/service' // Fixed typo
import { create } from 'zustand'

type ServiceState = {
  services: Service[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setServices: (services: Service[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // API calls
  fetchServices: () => Promise<void>
  createService: (service: ServicePayload) => Promise<void> // Fixed typo
  updateService: (id: string, service: Partial<ServicePayload>) => Promise<void> // Added
  deleteService: (id: string) => Promise<void> // Added
}

export const useService = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,

  setServices: (services) => set({ services }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchServices: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/service')
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = await response.json()
      // Ensure we always set an array
      const services = Array.isArray(data) ? data : []
      set({ services, isLoading: false })
    } catch (error) {
      console.error('Error fetching services:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false,
        services: [] // Ensure services is always an array
      })
    }
  },

  createService: async (service: ServicePayload) => { // Fixed typo
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create service')
      }
      
      const newService = await response.json()
      set(state => ({ 
        services: Array.isArray(state.services) ? [newService, ...state.services] : [newService], 
        isLoading: false 
      }))
    } catch (error) {
      console.error('Error creating service:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
      throw error
    }
  },

  // Added update method
  updateService: async (id: string, serviceUpdate: Partial<ServicePayload>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/service/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceUpdate),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update service')
      }
      
      const updatedService = await response.json()
      const { services } = get()
      const updatedServices = services.map(s => 
        s.id === id ? updatedService : s
      )
      set({ services: updatedServices, isLoading: false })
    } catch (error) {
      console.error('Error updating service:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
      throw error
    }
  },

  // Added delete method
  deleteService: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/service/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete service')
      }
      
      const { services } = get()
      const filteredServices = services.filter(s => s.id !== id)
      set({ services: filteredServices, isLoading: false })
    } catch (error) {
      console.error('Error deleting service:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
      throw error
    }
  },
}))