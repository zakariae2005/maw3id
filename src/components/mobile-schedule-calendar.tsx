"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { format, startOfDay, addDays, subDays, setHours, setMinutes, getHours } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings, Plus, Clock, User, Briefcase, MoreHorizontal } from "lucide-react"

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

export default function MobileScheduleCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [workingHoursStart, setWorkingHoursStart] = useState<number>(9)
  const [workingHoursEnd, setWorkingHoursEnd] = useState<number>(18)
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
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    serviceId: "",
    appointmentDate: selectedDate,
    startHour: "9",
    startMinute: "0",
    duration: "30", // in minutes
  })

  // Load data on mount
  useEffect(() => {
    fetchAppointments()
    fetchServices()
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

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1))
  }

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  const handleToday = () => {
    setSelectedDate(startOfDay(new Date()))
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

  const generateTimeSlots = (startHour: number, endHour: number) => {
    const slots = []
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(setMinutes(setHours(selectedDate, hour), 0))
    }
    return slots
  }

  const timeSlots = useMemo(
    () => generateTimeSlots(workingHoursStart, workingHoursEnd),
    [selectedDate, workingHoursStart, workingHoursEnd],
  )

  const appointmentsByHour = useMemo(() => {
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
  }, [calendarAppointments, selectedDate])

  const todayAppointments = calendarAppointments.filter(app => 
    format(app.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  )

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
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePreviousDay} 
                aria-label="Previous day"
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNextDay} 
                aria-label="Next day"
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleToday} 
                className="ml-2 text-xs bg-slate-900 text-white hover:bg-slate-800 border-slate-900"
              >
                Today
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
              {/* Calendar Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center h-8 px-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">{format(selectedDate, "MMM dd")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 rounded-lg shadow-lg bg-white dark:bg-slate-800">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(startOfDay(date))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Settings Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center justify-center h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-sm p-6 bg-white dark:bg-slate-900 rounded-l-lg shadow-lg">
                  <SheetHeader>
                    <SheetTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Settings</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6">
                    {/* Working Hours */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Working Hours</Label>
                      <div className="flex flex-col gap-3">
                        <div>
                          <Label className="text-xs text-slate-500 dark:text-slate-400">Start Time</Label>
                          <Select
                            value={String(workingHoursStart)}
                            onValueChange={(value) => setWorkingHoursStart(Number(value))}
                          >
                            <SelectTrigger className="h-9 text-sm rounded-md border border-slate-200 dark:border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800">
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
                            <SelectTrigger className="h-9 text-sm rounded-md border border-slate-200 dark:border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800">
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={String(i)}>
                                  {format(setHours(new Date(), i), "h:mm a")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Current Schedule Display */}
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
            </div>
          </div>
          
          {/* Date and Stats Row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {format(selectedDate, "EEEE, MMMM d")}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            
            <Button 
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Add Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-4 h-12 w-12 rounded-full bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
            size="icon"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium">
                Client Name
              </Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={newAppointment.clientName}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceName" className="text-sm font-medium">
                Service Type
              </Label>
              <Select
                value={newAppointment.serviceId}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, serviceId: value }))}
              >
                <SelectTrigger className="h-9">
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
              <Label className="text-sm font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9"
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
                <Label className="text-xs font-medium text-slate-600">Hour</Label>
                <Select
                  value={newAppointment.startHour}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, startHour: value }))}
                >
                  <SelectTrigger className="h-8 text-sm">
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
                <Label className="text-xs font-medium text-slate-600">Minute</Label>
                <Select
                  value={newAppointment.startMinute}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, startMinute: value }))}
                >
                  <SelectTrigger className="h-8 text-sm">
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
                <Label className="text-xs font-medium text-slate-600">Duration</Label>
                <Select
                  value={newAppointment.duration}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger className="h-8 text-sm">
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
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-1">
          {timeSlots.map((slotTime, index) => {
            const hour = getHours(slotTime)
            const appointmentsInSlot = appointmentsByHour[hour] || []
            const isCurrentHour = getHours(new Date()) === hour && format(new Date(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            
            return (
              <div key={index} className="flex gap-3">
                {/* Time Column */}
                <div className="w-16 flex-shrink-0 pt-3">
                  <div className={cn(
                    "text-xs font-medium text-right",
                    isCurrentHour 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                    {format(slotTime, "h:mm a")}
                  </div>
                </div>
                
                {/* Appointments Column */}
                <div className={cn(
                  "flex-1 min-h-[60px] py-2 border-b",
                  isCurrentHour 
                    ? "border-slate-300 dark:border-slate-600" 
                    : "border-slate-100 dark:border-slate-800"
                )}>
                  {appointmentsInSlot.length > 0 ? (
                    <div className="space-y-2">
                      {appointmentsInSlot.map((app) => (
                        <Card 
                          key={app.id} 
                          className={cn(
                            "p-3 border cursor-pointer hover:shadow-sm transition-all duration-150", 
                            app.color
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{app.serviceName}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs">
                                    {app.clientName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs truncate">{app.clientName}</span>
                              </div>
                              <div className="text-xs opacity-75 mt-1">
                                {format(app.startTime, "h:mm a")} - {format(app.endTime, "h:mm a")}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xs text-slate-400">—</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}