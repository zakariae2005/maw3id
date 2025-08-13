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

interface Appointment {
  id: string
  clientName: string
  serviceName: string
  startTime: Date
  endTime: Date
  color: string
}

const colorOptions = [
  "bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300 text-orange-800",
  "bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300 text-purple-800",
  "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800",
  "bg-gradient-to-r from-green-100 to-green-200 border-green-300 text-green-800",
  "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 text-blue-800",
  "bg-gradient-to-r from-indigo-100 to-indigo-200 border-indigo-300 text-indigo-800",
  "bg-gradient-to-r from-pink-100 to-pink-200 border-pink-300 text-pink-800",
  "bg-gradient-to-r from-teal-100 to-teal-200 border-teal-300 text-teal-800",
]

const serviceOptions = [
  "Health appointment",
  "General Checkup",
  "Consultation",
  "Lab Work",
  "Standard Visit",
  "Follow-Up",
  "Therapy Session",
  "Dental Cleaning",
  "Eye Exam",
  "Physical Therapy",
]

const generateWeeklyAppointments = (weekStart: Date): Appointment[] => {
  const appointments: Appointment[] = []
  
  // Monday appointments
  appointments.push(
    {
      id: "1",
      clientName: "Esther Howard",
      serviceName: "Health appointment",
      startTime: setMinutes(setHours(weekStart, 9), 0),
      endTime: setMinutes(setHours(weekStart, 10), 0),
      color: "bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300 text-orange-800",
    },
    {
      id: "2",
      clientName: "Kristin Watson",
      serviceName: "General Checkup",
      startTime: setMinutes(setHours(weekStart, 10), 0),
      endTime: setMinutes(setHours(weekStart, 10), 30),
      color: "bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300 text-purple-800",
    },
  )

  // Tuesday appointments
  const tuesday = addDays(weekStart, 1)
  appointments.push({
    id: "3",
    clientName: "Dianne Russell",
    serviceName: "Follow-Up",
    startTime: setMinutes(setHours(tuesday, 9), 15),
    endTime: setMinutes(setHours(tuesday, 10), 0),
    color: "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 text-blue-800",
  })

  // Thursday appointments
  const thursday = addDays(weekStart, 3)
  appointments.push(
    {
      id: "4",
      clientName: "Arlene McCoy",
      serviceName: "Consultation",
      startTime: setMinutes(setHours(thursday, 9), 0),
      endTime: setMinutes(setHours(thursday, 9), 30),
      color: "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800",
    },
    {
      id: "5",
      clientName: "Jane Cooper",
      serviceName: "Standard Visit",
      startTime: setMinutes(setHours(thursday, 13), 0),
      endTime: setMinutes(setHours(thursday, 13), 30),
      color: "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 text-blue-800",
    },
  )

  // Friday appointments
  const friday = addDays(weekStart, 4)
  appointments.push({
    id: "7",
    clientName: "Esther Howard",
    serviceName: "Health appointment",
    startTime: setMinutes(setHours(friday, 9), 0),
    endTime: setMinutes(setHours(friday, 10), 0),
    color: "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 text-blue-800",
  })

  // Saturday appointments
  const saturday = addDays(weekStart, 5)
  appointments.push(
    {
      id: "8",
      clientName: "Annette Black",
      serviceName: "Consultation",
      startTime: setMinutes(setHours(saturday, 12), 0),
      endTime: setMinutes(setHours(saturday, 12), 30),
      color: "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800",
    },
    {
      id: "9",
      clientName: "Floyd Miles",
      serviceName: "Follow-Up",
      startTime: setMinutes(setHours(saturday, 14), 0),
      endTime: setMinutes(setHours(saturday, 15), 0),
      color: "bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300 text-purple-800",
    },
  )

  // Sunday appointments
  const sunday = addDays(weekStart, 6)
  appointments.push(
    {
      id: "6",
      clientName: "Wade Warren",
      serviceName: "Follow-Up",
      startTime: setMinutes(setHours(sunday, 10), 0),
      endTime: setMinutes(setHours(sunday, 10), 30),
      color: "bg-gradient-to-r from-green-100 to-green-200 border-green-300 text-green-800",
    },
    {
      id: "10",
      clientName: "Courtney Henry",
      serviceName: "Consultation",
      startTime: setMinutes(setHours(sunday, 15), 0),
      endTime: setMinutes(setHours(sunday, 15), 30),
      color: "bg-gradient-to-r from-green-100 to-green-200 border-green-300 text-green-800",
    },
  )

  return appointments
}

export default function DesktopScheduleCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [workingHoursStart, setWorkingHoursStart] = useState<number>(8)
  const [workingHoursEnd, setWorkingHoursEnd] = useState<number>(20)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const scheduleRef = useRef<HTMLDivElement>(null)

  // Form state
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    serviceName: "",
    appointmentDate: new Date(),
    startHour: "9",
    startMinute: "0",
    duration: "30",
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

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

  const initialAppointments = useMemo(() => generateWeeklyAppointments(selectedDate), [selectedDate])
  const allAppointments = [...initialAppointments, ...appointments]

  const handlePreviousWeek = () => {
    setSelectedDate((prev) => subDays(prev, 7))
  }

  const handleNextWeek = () => {
    setSelectedDate((prev) => addDays(prev, 7))
  }

  const handleToday = () => {
    setSelectedDate(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const handleCreateAppointment = () => {
    const startTime = setMinutes(
      setHours(newAppointment.appointmentDate, parseInt(newAppointment.startHour)),
      parseInt(newAppointment.startMinute)
    )
    const endTime = new Date(startTime.getTime() + parseInt(newAppointment.duration) * 60000)
    
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)]

    const appointment: Appointment = {
      id: Date.now().toString(),
      clientName: newAppointment.clientName,
      serviceName: newAppointment.serviceName,
      startTime,
      endTime,
      color: randomColor,
    }

    setAppointments(prev => [...prev, appointment])
    setNewAppointment({
      clientName: "",
      serviceName: "",
      appointmentDate: new Date(),
      startHour: "9",
      startMinute: "0",
      duration: "30",
    })
    setIsCreateDialogOpen(false)
  }

  const getAppointmentPosition = (appointment: Appointment) => {
    const startMinutes = getHours(appointment.startTime) * 60 + getMinutes(appointment.startTime)
    const endMinutes = getHours(appointment.endTime) * 60 + getMinutes(appointment.endTime)
    const workingStartMinutes = workingHoursStart * 60

    const top = ((startMinutes - workingStartMinutes) / 60) * 60
    const height = ((endMinutes - startMinutes) / 60) * 60

    return { top: `${top}px`, height: `${height}px` }
  }

  const currentHour = getHours(currentTime)
  const currentMinute = getMinutes(currentTime)
  const currentLineTop = ((currentHour * 60 + currentMinute - workingHoursStart * 60) / 60) * 60

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      
      {/* Create Appointment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 z-50 border-2 border-white dark:border-gray-800"
            size="icon"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md rounded-xl bg-gradient-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Client Name
              </Label>
              <Input
                id="clientName"
                placeholder="Enter client's full name"
                value={newAppointment.clientName}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                className="bg-white/50 dark:bg-gray-800/50 border-blue-200 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Service
              </Label>
              <Select
                value={newAppointment.serviceName}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, serviceName: value }))}
              >
                <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-blue-200">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white/50 dark:bg-gray-800/50 border-blue-200"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                    {format(newAppointment.appointmentDate, "PPP")}
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hour</Label>
                <Select
                  value={newAppointment.startHour}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, startHour: value }))}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-blue-200">
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
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minute</Label>
                <Select
                  value={newAppointment.startMinute}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, startMinute: value }))}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-blue-200">
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
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</Label>
                <Select
                  value={newAppointment.duration}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-blue-200">
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
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={!newAppointment.clientName || !newAppointment.serviceName}
            >
              Create Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Schedule Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Schedule
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleToday} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
              >
                Today
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePreviousWeek} 
                aria-label="Previous week"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNextWeek} 
                aria-label="Next week"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 ml-2">
                {format(selectedDate, "MMMM yyyy")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Search"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Info"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200"
              >
                <Info className="h-5 w-5" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    aria-label="Settings"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xs bg-gradient-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
                  <SheetHeader>
                    <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Working Hours
                    </SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Start Time</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">When your day begins</p>
                        </div>
                      </div>
                      <Select
                        value={String(workingHoursStart)}
                        onValueChange={(value) => setWorkingHoursStart(Number(value))}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-blue-200">
                          <SelectValue placeholder="Select start hour" />
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
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-50">End Time</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">When your day ends</p>
                        </div>
                      </div>
                      <Select 
                        value={String(workingHoursEnd)} 
                        onValueChange={(value) => setWorkingHoursEnd(Number(value))}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-blue-200">
                          <SelectValue placeholder="Select end hour" />
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

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Schedule</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        {format(setHours(new Date(), workingHoursStart), "h:mm a")} - {format(setHours(new Date(), workingHoursEnd), "h:mm a")}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                        {workingHoursEnd - workingHoursStart} hours per day
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <ToggleGroup type="single" defaultValue="weekly" className="hidden sm:flex bg-white/50 dark:bg-gray-800/50 rounded-lg p-1">
              <ToggleGroupItem 
                value="daily" 
                aria-label="Toggle daily view"
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-indigo-600 data-[state=on]:text-white"
              >
                Daily
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="weekly" 
                aria-label="Toggle weekly view"
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-indigo-600 data-[state=on]:text-white"
              >
                Weekly
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="monthly" 
                aria-label="Toggle monthly view"
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-indigo-600 data-[state=on]:text-white"
              >
                Monthly
              </ToggleGroupItem>
            </ToggleGroup>
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Schedule
            </Button>
          </div>
        </header>

        {/* Schedule Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] h-full">
            {/* Time Header */}
            <div className="border-r border-b bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-500 dark:text-gray-400 text-sm p-2 flex items-center justify-center font-medium">
              GMT +1
            </div>
            {/* Day Headers */}
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date())
              return (
                <div
                  key={index}
                  className={cn(
                    "border-b border-r p-3 text-center transition-all duration-200",
                    isToday 
                      ? "bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950" 
                      : "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                  )}
                >
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {format(day, "EEE").toUpperCase()}
                  </div>
                  <div
                    className={cn(
                      "font-bold text-lg",
                      isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-50",
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
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 z-20 shadow-lg" 
                    style={{ top: `${currentLineTop}px` }}
                  >
                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full shadow-md font-medium">
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
                        "text-right text-sm font-medium pr-3 pt-3 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200",
                        isCurrentHour 
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20" 
                          : "text-gray-500 dark:text-gray-400"
                      )}>
                        {format(slotTime, "h a")}
                      </div>
                      {weekDays.map((day, dayIndex) => {
                        const isCurrentCell = isCurrentHour && isSameDay(day, currentTime)
                        
                        return (
                          <div
                            key={`${slotIndex}-${dayIndex}`}
                            className={cn(
                              "border-b border-r border-gray-200 dark:border-gray-700 relative hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-200",
                              isCurrentCell && "bg-blue-50/50 dark:bg-blue-900/20"
                            )}
                            style={{ height: "60px" }}
                          >
                            {/* Render appointments for this day and hour */}
                            {allAppointments
                              .filter(
                                (app) =>
                                  isSameDay(app.startTime, day) &&
                                  getHours(app.startTime) === getHours(slotTime) &&
                                  isWithinInterval(app.startTime, { start: slotTime, end: addDays(slotTime, 1) }),
                              )
                              .map((app) => {
                                const { top, height } = getAppointmentPosition(app)
                                return (
                                  <Card
                                    key={app.id}
                                    className={cn(
                                      "absolute w-[calc(100%-8px)] mx-1 p-2 rounded-xl shadow-sm border-2 overflow-hidden cursor-pointer transform hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
                                      app.color,
                                    )}
                                    style={{ top, height }}
                                  >
                                    <div className="font-semibold text-sm leading-tight mb-1">{app.serviceName}</div>
                                    <div className="text-xs leading-tight mb-1 opacity-75">
                                      {format(app.startTime, "h:mm a")} - {format(app.endTime, "h:mm a")}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                      <Avatar className="h-4 w-4 ring-2 ring-white shadow-sm">
                                        <AvatarImage src="/placeholder.svg?height=16&width=16" alt={app.clientName} />
                                        <AvatarFallback className="text-xs font-medium">
                                          {app.clientName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium truncate">{app.clientName}</span>
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