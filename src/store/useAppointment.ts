// store/useAppointment.ts
import { Appointment, AppointmentPayload } from '@/types/appointment'
import { create } from 'zustand'

type AppointmentState = {
  appointments: Appointment[]
  isLoading: boolean
  error: string | null

  // Actions
  setAppointments: (appointments: Appointment[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // API calls
  fetchAppointments: () => Promise<void>
  createAppointment: (appointment: AppointmentPayload) => Promise<void>
}

export const useAppointment = create<AppointmentState>((set, get) => ({
  appointments: [],
  isLoading: false,
  error: null,

  setAppointments: (appointments) => set({ appointments }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchAppointments: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/appointment')
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      const data = await response.json()
      // Ensure we always set an array and convert string dates to Date objects
      const appointments = Array.isArray(data) ? data.map(apt => ({
        ...apt,
        startTime: new Date(apt.startTime)
      })) : []
      set({ appointments, isLoading: false })
    } catch (error) {
      console.error('Error fetching appointments:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false,
        appointments: []
      })
    }
  },

  createAppointment: async (appointment: AppointmentPayload) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appointment,
          startTime: appointment.startTime.toISOString()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create appointment')
      }

      const newAppointment = await response.json()
      // Convert string date back to Date object
      const appointmentWithDate = {
        ...newAppointment,
        startTime: new Date(newAppointment.startTime)
      }
      
      set(state => ({ 
        appointments: Array.isArray(state.appointments) 
          ? [appointmentWithDate, ...state.appointments] 
          : [appointmentWithDate], 
        isLoading: false 
      }))
    } catch (error) {
      console.error('Error creating appointment:', error)
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
      throw error
    }
  },


}))