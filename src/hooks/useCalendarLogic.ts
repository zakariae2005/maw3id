"use client"

import { useState, useMemo, useEffect } from "react"
import {
  format,
  startOfWeek,
  addDays,
  subDays,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useAppointment } from "@/store/useAppointment"
import { useService } from "@/store/useService"

interface CalendarAppointment {
  id: string
  clientName: string
  serviceName: string
  startTime: Date
  endTime: Date
  color: string
  serviceId: string
}

const colorOptions = [
  "bg-blue-50 border-blue-200 text-blue-900",
  "bg-emerald-50 border-emerald-200 text-emerald-900",
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-purple-50 border-purple-200 text-purple-900",
  "bg-rose-50 border-rose-200 text-rose-900",
  "bg-teal-50 border-teal-200 text-teal-900",
  "bg-indigo-50 border-indigo-200 text-indigo-900",
  "bg-orange-50 border-orange-200 text-orange-900",
]

interface NewAppointment {
  clientName: string
  serviceId: string
  appointmentDate: Date
  startHour: string
  startMinute: string
  duration: string
}

interface UseCalendarLogicProps {
  initialDate?: Date
  isWeekView?: boolean
}

export function useCalendarLogic({ 
  initialDate = new Date(), 
  isWeekView = false 
}: UseCalendarLogicProps = {}) {
  // Date management
  const [selectedDate, setSelectedDate] = useState<Date>(
    isWeekView ? startOfWeek(initialDate, { weekStartsOn: 1 }) : startOfDay(initialDate)
  )
  
  // Working hours
  const [workingHoursStart, setWorkingHoursStart] = useState<number>(isWeekView ? 8 : 9)
  const [workingHoursEnd, setWorkingHoursEnd] = useState<number>(isWeekView ? 20 : 18)
  
  // Current time tracking
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const { toast } = useToast()

  // Store hooks
  const { 
    appointments, 
    isLoading: appointmentsLoading, 
    error: appointmentsError,
    fetchAppointments, 
    createAppointment 
  } = useAppointment()

  const { 
    services, 
    isLoading: servicesLoading, 
    error: servicesError,
    fetchServices 
  } = useService()

  // Form state
  const [newAppointment, setNewAppointment] = useState<NewAppointment>({
    clientName: "",
    serviceId: "",
    appointmentDate: selectedDate,
    startHour: "9",
    startMinute: "0",
    duration: "30",
  })

  // Load data on mount
  useEffect(() => {
    fetchAppointments()
    fetchServices()
  }, [fetchAppointments, fetchServices])

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Update appointment date when selected date changes
  useEffect(() => {
    setNewAppointment(prev => ({ ...prev, appointmentDate: selectedDate }))
  }, [selectedDate])

  // Convert backend appointments to calendar format
  const calendarAppointments: CalendarAppointment[] = useMemo(() => {
    return appointments.map((apt, index) => {
      const startTime = new Date(apt.startTime)
      const endTime = new Date(startTime.getTime() + (apt.duration || 30) * 60000)
      const colorIndex = index % colorOptions.length
      
      return {
        id: apt.id,
        clientName: apt.clientName,
        serviceName: apt.service.name,
        startTime,
        endTime,
        color: colorOptions[colorIndex],
        serviceId: apt.serviceId
      }
    })
  }, [appointments])

  // Generate week days for desktop view
  const weekDays = useMemo(() => {
    if (!isWeekView) return []
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
  }, [selectedDate, isWeekView])

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      slots.push(setMinutes(setHours(selectedDate, hour), 0))
    }
    return slots
  }, [selectedDate, workingHoursStart, workingHoursEnd])

  // Group appointments by hour for mobile view
  const appointmentsByHour = useMemo(() => {
    if (isWeekView) return {}
    
    const groups: { [key: number]: CalendarAppointment[] } = {}
    calendarAppointments
      .filter(app => format(app.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
      .forEach((app) => {
        const hour = getHours(app.startTime)
        if (!groups[hour]) {
          groups[hour] = []
        }
        groups[hour].push(app)
      })
    
    Object.keys(groups).forEach((hour) => {
      groups[Number(hour)].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    })
    return groups
  }, [calendarAppointments, selectedDate, isWeekView])

  // Get appointments for selected date
  const todayAppointments = useMemo(() => 
    calendarAppointments.filter(app => 
      format(app.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    ), [calendarAppointments, selectedDate]
  )

  // Navigation handlers
  const handlePreviousWeek = () => {
    setSelectedDate((prev) => subDays(prev, 7))
  }

  const handleNextWeek = () => {
    setSelectedDate((prev) => addDays(prev, 7))
  }

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1))
  }

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  const handleToday = () => {
    setSelectedDate(isWeekView ? startOfWeek(new Date(), { weekStartsOn: 1 }) : startOfDay(new Date()))
  }

  // Appointment creation
  const handleCreateAppointment = async () => {
    try {
      if (!newAppointment.clientName || !newAppointment.serviceId) {
        toast({
          
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const startTime = setMinutes(
        setHours(newAppointment.appointmentDate, parseInt(newAppointment.startHour)),
        parseInt(newAppointment.startMinute)
      )

      await createAppointment({
        clientName: newAppointment.clientName,
        serviceId: newAppointment.serviceId,
        startTime,
        duration: parseInt(newAppointment.duration)
      })

      setNewAppointment({
        clientName: "",
        serviceId: "",
        appointmentDate: selectedDate,
        startHour: "9",
        startMinute: "0",
        duration: "30",
      })
      setIsCreateDialogOpen(false)

      toast({
        title: "Success",
        description: "Appointment created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      })
    }
  }

  // Utility functions for desktop view
  const getAppointmentPosition = (appointment: CalendarAppointment, slotTime: Date) => {
    const appointmentMinutes = getMinutes(appointment.startTime)
    const slotMinutes = getMinutes(slotTime)
    
    const minuteOffset = (appointmentMinutes - slotMinutes) * (60 / 60)
    const duration = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60)
    const height = Math.max(20, Math.min(60, duration))
    
    return { 
      top: `${Math.max(0, minuteOffset)}px`, 
      height: `${height}px` 
    }
  }

  // Current time line position for desktop
  const getCurrentTimeLinePosition = () => {
    const currentHour = getHours(currentTime)
    const currentMinute = getMinutes(currentTime)
    return ((currentHour * 60 + currentMinute - workingHoursStart * 60) / 60) * 60
  }

  // Retry function
  const handleRetry = () => {
    fetchAppointments()
    fetchServices()
  }

  return {
    // State
    selectedDate,
    setSelectedDate,
    workingHoursStart,
    setWorkingHoursStart,
    workingHoursEnd,
    setWorkingHoursEnd,
    currentTime,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newAppointment,
    setNewAppointment,
    
    // Store data
    appointments,
    services,
    appointmentsLoading,
    servicesLoading,
    appointmentsError,
    servicesError,
    
    // Computed data
    calendarAppointments,
    weekDays,
    timeSlots,
    appointmentsByHour,
    todayAppointments,
    
    // Handlers
    handlePreviousWeek,
    handleNextWeek,
    handlePreviousDay,
    handleNextDay,
    handleToday,
    handleCreateAppointment,
    handleRetry,
    
    // Utility functions
    getAppointmentPosition,
    getCurrentTimeLinePosition,
  }
}