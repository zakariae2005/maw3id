"use client"

import * as React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
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
  isWithinInterval,
  startOfDay,
} from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings, Plus, Clock, User, Briefcase, Search, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useToast } from "@/hooks/use-toast"

// Import your stores
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

export default function ProfessionalDesktopCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [workingHoursStart, setWorkingHoursStart] = useState<number>(8)
  const [workingHoursEnd, setWorkingHoursEnd] = useState<number>(20)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const scheduleRef = useRef<HTMLDivElement>(null)
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
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    serviceId: "",
    appointmentDate: new Date(),
    startHour: "9",
    startMinute: "0",
    duration: "30", // in minutes
  })

  // Load data on mount
  useEffect(() => {
    fetchAppointments()
    fetchServices()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

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

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
  }, [selectedDate])

  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      slots.push(setMinutes(setHours(new Date(), hour), 0))
    }
    return slots
  }, [workingHoursStart, workingHoursEnd])

  const handlePreviousWeek = () => {
    setSelectedDate((prev) => subDays(prev, 7))
  }

  const handleNextWeek = () => {
    setSelectedDate((prev) => addDays(prev, 7))
  }

  const handleToday = () => {
    setSelectedDate(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const handleCreateAppointment = async () => {
    try {
      if (!newAppointment.clientName || !newAppointment.serviceId) {
        toast({
          title: "Error",
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
        appointmentDate: new Date(),
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

  const getAppointmentPosition = (appointment: CalendarAppointment, slotTime: Date) => {
    const appointmentMinutes = getMinutes(appointment.startTime)
    const slotMinutes = getMinutes(slotTime)
    
    // Position within the hour slot (60px height)
    const minuteOffset = (appointmentMinutes - slotMinutes) * (60 / 60) // 1px per minute
    const duration = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60) // duration in minutes
    const height = Math.max(20, Math.min(60, duration)) // Min 20px, max 60px height
    
    return { 
      top: `${Math.max(0, minuteOffset)}px`, 
      height: `${height}px` 
    }
  }

  const currentHour = getHours(currentTime)
  const currentMinute = getMinutes(currentTime)
  const currentLineTop = ((currentHour * 60 + currentMinute - workingHoursStart * 60) / 60) * 60

  // Show loading state
  if (appointmentsLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-2"></div>
          <p className="text-sm text-slate-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (appointmentsError || servicesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading data</p>
          <p className="text-sm text-slate-600">{appointmentsError || servicesError}</p>
          <Button onClick={() => {
            fetchAppointments()
            fetchServices()
          }} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      
      {/* Create Appointment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
            size="icon"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              New Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Client Name
              </Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={newAppointment.clientName}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                className="h-9 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Service Type
              </Label>
              <Select
                value={newAppointment.serviceId}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, serviceId: value }))}
              >
                <SelectTrigger className="h-9 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9 border-slate-200 dark:border-slate-700"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newAppointment.appointmentDate, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newAppointment.appointmentDate}
                    onSelect={(date) => date && setNewAppointment(prev => ({ ...prev, appointmentDate: startOfDay(date) }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Hour</Label>
                <Select
                  value={newAppointment.startHour}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, startHour: value }))}
                >
                  <SelectTrigger className="h-8 text-sm border-slate-200 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Minute</Label>
                <Select
                  value={newAppointment.startMinute}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, startMinute: value }))}
                >
                  <SelectTrigger className="h-8 text-sm border-slate-200 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={String(i * 5)}>
                        {(i * 5).toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Duration</Label>
                <Select
                  value={newAppointment.duration}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger className="h-8 text-sm border-slate-200 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15m</SelectItem>
                    <SelectItem value="30">30m</SelectItem>
                    <SelectItem value="45">45m</SelectItem>
                    <SelectItem value="60">1h</SelectItem>
                    <SelectItem value="90">1.5h</SelectItem>
                    <SelectItem value="120">2h</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleCreateAppointment}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-9"
              disabled={!newAppointment.clientName || !newAppointment.serviceId}
            >
              Create Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Schedule Area */}
      <div className="flex-1 flex flex-col">
        {/* Professional Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Schedule
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {format(selectedDate, "MMMM yyyy")}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleToday} 
                    className="bg-slate-900 text-white hover:bg-slate-800 border-slate-900"
                  >
                    Today
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handlePreviousWeek} 
                    aria-label="Previous week"
                    className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleNextWeek} 
                    aria-label="Next week"
                    className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* View Toggle */}
                <ToggleGroup type="single" defaultValue="weekly" className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <ToggleGroupItem 
                    value="daily" 
                    size="sm"
                    className="data-[state=on]:bg-slate-900 data-[state=on]:text-white text-xs"
                  >
                    Daily
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="weekly" 
                    size="sm"
                    className="data-[state=on]:bg-slate-900 data-[state=on]:text-white text-xs"
                  >
                    Weekly
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="monthly" 
                    size="sm"
                    className="data-[state=on]:bg-slate-900 data-[state=on]:text-white text-xs"
                  >
                    Monthly
                  </ToggleGroupItem>
                </ToggleGroup>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-sm p-6 bg-white dark:bg-slate-900">
                      <SheetHeader>
                        <SheetTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Settings</SheetTitle>
                      </SheetHeader>

                      <div className="space-y-6 mt-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Working Hours</Label>
                          <div className="flex flex-col gap-3">
                            <div>
                              <Label className="text-xs text-slate-500 dark:text-slate-400">Start Time</Label>
                              <Select
                                value={String(workingHoursStart)}
                                onValueChange={(value) => setWorkingHoursStart(Number(value))}
                              >
                                <SelectTrigger className="h-9 text-sm border-slate-200 dark:border-slate-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <SelectItem key={i} value={String(i)}>
                                      {format(setHours(new Date(), i), "h:mm a")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs text-slate-500 dark:text-slate-400">End Time</Label>
                              <Select 
                                value={String(workingHoursEnd)} 
                                onValueChange={(value) => setWorkingHoursEnd(Number(value))}
                              >
                                <SelectTrigger className="h-9 text-sm border-slate-200 dark:border-slate-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <SelectItem key={i} value={String(i)}>
                                      {format(setHours(new Date(), i), "h:mm a")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Current schedule</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {format(setHours(new Date(), workingHoursStart), "h:mm a")} - {format(setHours(new Date(), workingHoursEnd), "h:mm a")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <Button 
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Schedule Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] h-full">
            {/* Time Header */}
            <div className="border-r border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs p-3 flex items-center justify-center font-medium">
              GMT +1
            </div>
            {/* Day Headers */}
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date())
              return (
                <div
                  key={index}
                  className={cn(
                    "border-b border-r border-slate-200 dark:border-slate-700 p-3 text-center bg-white dark:bg-slate-800",
                    isToday && "bg-slate-50 dark:bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isToday ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {format(day, "EEE").toUpperCase()}
                  </div>
                  <div
                    className={cn(
                      "font-semibold text-lg",
                      isToday ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300",
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              )
            })}

            {/* Time Slots and Appointments */}
            <ScrollArea className="col-span-full h-full">
              <div ref={scheduleRef} className="grid grid-cols-[80px_repeat(7,1fr)] relative min-h-[calc(100vh-160px)]">
                {/* Current Time Line */}
                {weekDays.some(day => isSameDay(day, currentTime)) && 
                 currentHour >= workingHoursStart && 
                 currentHour < workingHoursEnd && (
                  <div 
                    className="absolute left-0 right-0 h-0.5 bg-red-500 z-20" 
                    style={{ top: `${currentLineTop}px` }}
                  >
                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
                      {format(currentTime, "h:mm a")}
                    </div>
                  </div>
                )}

                {timeSlots.map((slotTime, slotIndex) => {
                  const isCurrentHour = getHours(currentTime) === getHours(slotTime) && 
                                       weekDays.some(day => isSameDay(day, currentTime))
                  
                  return (
                    <React.Fragment key={slotIndex}>
                      <div className={cn(
                        "text-right text-xs font-medium pr-3 pt-3 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
                        isCurrentHour 
                          ? "text-slate-900 dark:text-slate-100" 
                          : "text-slate-500 dark:text-slate-400"
                      )}>
                        {format(slotTime, "h a")}
                      </div>
                      {weekDays.map((day, dayIndex) => {
                        const isCurrentCell = isCurrentHour && isSameDay(day, currentTime)
                        
                        return (
                          <div
                            key={`${slotIndex}-${dayIndex}`}
                            className={cn(
                              "border-b border-r border-slate-200 dark:border-slate-700 relative hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150",
                              isCurrentCell && "bg-slate-50 dark:bg-slate-800"
                            )}
                            style={{ height: "60px" }}
                          >
                            {/* Render appointments for this day and hour */}
                            {calendarAppointments
                              .filter(
                                (app) =>
                                  isSameDay(app.startTime, day) &&
                                  getHours(app.startTime) === getHours(slotTime)
                              )
                              .map((app) => {
                                const { top, height } = getAppointmentPosition(app, slotTime)
                                return (
                                  <Card
                                    key={app.id}
                                    className={cn(
                                      "absolute left-1 right-1 p-2 border cursor-pointer hover:shadow-md transition-all duration-150 rounded-md z-10",
                                      app.color,
                                    )}
                                    style={{ top, height }}
                                  >
                                    <div className="h-full flex flex-col justify-between">
                                      <div>
                                        <div className="font-semibold text-xs leading-tight truncate mb-1">
                                          {app.serviceName}
                                        </div>
                                        <div className="text-xs text-opacity-80 leading-tight">
                                          {format(app.startTime, "h:mm a")}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 mt-1">
                                        <Avatar className="h-3 w-3">
                                          <AvatarFallback className="text-xs font-semibold">
                                            {app.clientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium truncate">
                                          {app.clientName}
                                        </span>
                                      </div>
                                    </div>
                                  </Card>
                                )
                              })}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}