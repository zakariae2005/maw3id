"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { format, startOfDay, addDays, subDays, setHours, setMinutes, getHours } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Settings, Plus, Clock, User, Briefcase } from "lucide-react"

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

interface Appointment {
  id: string
  clientName: string
  serviceName: string
  startTime: Date
  endTime: Date
  color: string
}

const colorOptions = [
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-yellow-100 border-yellow-300 text-yellow-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-teal-100 border-teal-300 text-teal-800",
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

export default function MobileScheduleCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [workingHoursStart, setWorkingHoursStart] = useState<number>(9)
  const [workingHoursEnd, setWorkingHoursEnd] = useState<number>(18)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Form state
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    serviceName: "",
    appointmentDate: selectedDate,
    startHour: "9",
    startMinute: "0",
    duration: "30", // in minutes
  })

  // Initial dummy data
  const initialAppointments: Appointment[] = useMemo(() => {
    const today = selectedDate
    return [
      {
        id: "1",
        clientName: "Esther Howard",
        serviceName: "Health appointment",
        startTime: setMinutes(setHours(today, 9), 0),
        endTime: setMinutes(setHours(today, 10), 0),
        color: "bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300 text-orange-800",
      },
      {
        id: "2",
        clientName: "Kristin Watson",
        serviceName: "General Checkup",
        startTime: setMinutes(setHours(today, 10), 0),
        endTime: setMinutes(setHours(today, 10), 30),
        color: "bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300 text-purple-800",
      },
      {
        id: "3",
        clientName: "Arlene McCoy",
        serviceName: "Consultation",
        startTime: setMinutes(setHours(today, 13), 0),
        endTime: setMinutes(setHours(today, 13), 30),
        color: "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800",
      },
      {
        id: "4",
        clientName: "John Smith",
        serviceName: "Lab Work",
        startTime: setMinutes(setHours(today, 14), 0),
        endTime: setMinutes(setHours(today, 14), 45),
        color: "bg-gradient-to-r from-green-100 to-green-200 border-green-300 text-green-800",
      },
      {
        id: "5",
        clientName: "Jane Cooper",
        serviceName: "Standard Visit",
        startTime: setMinutes(setHours(today, 15), 0),
        endTime: setMinutes(setHours(today, 15), 30),
        color: "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 text-blue-800",
      },
      {
        id: "6",
        clientName: "Floyd Miles",
        serviceName: "Follow-Up",
        startTime: setMinutes(setHours(today, 16), 0),
        endTime: setMinutes(setHours(today, 17), 0),
        color: "bg-gradient-to-r from-indigo-100 to-indigo-200 border-indigo-300 text-indigo-800",
      },
    ]
  }, [selectedDate])

  const allAppointments = [...initialAppointments, ...appointments]

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1))
  }

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  const handleToday = () => {
    setSelectedDate(startOfDay(new Date()))
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
      color: randomColor.replace(/bg-(\w+)-100/, 'bg-gradient-to-r from-$1-100 to-$1-200'),
    }

    setAppointments(prev => [...prev, appointment])
    setNewAppointment({
      clientName: "",
      serviceName: "",
      appointmentDate: selectedDate,
      startHour: "9",
      startMinute: "0",
      duration: "30",
    })
    setIsCreateDialogOpen(false)
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
    const groups: { [key: number]: Appointment[] } = {}
    allAppointments
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
  }, [allAppointments, selectedDate])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePreviousDay} 
            aria-label="Previous day"
            className="hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextDay} 
            aria-label="Next day"
            className="hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            onClick={handleToday} 
            className="hidden sm:inline-flex bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
          >
            Today
          </Button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 ml-2">
            {format(selectedDate, "MMMM d, yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-auto justify-start text-left font-normal bg-white/50 dark:bg-gray-800/50 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-200"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                {format(selectedDate, "MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(startOfDay(date))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
      </header>

      {/* Floating Create Button */}
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

      {/* Main Content Area - Daily Schedule */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-[70px_1fr] gap-x-4">
          {timeSlots.map((slotTime, index) => {
            const hour = getHours(slotTime)
            const appointmentsInSlot = appointmentsByHour[hour] || []
            const isCurrentHour = getHours(new Date()) === hour && format(new Date(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            
            return (
              <React.Fragment key={index}>
                <div className={cn(
                  "text-right text-sm font-medium pt-3 transition-colors duration-200",
                  isCurrentHour 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {format(slotTime, "h a")}
                </div>
                <div className={cn(
                  "relative border-b py-3 min-h-[70px] transition-colors duration-200",
                  isCurrentHour 
                    ? "border-blue-200 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10" 
                    : "border-gray-200 dark:border-gray-700"
                )}>
                  {appointmentsInSlot.length > 0 ? (
                    <div className="grid gap-3">
                      {appointmentsInSlot.map((app) => (
                        <Card 
                          key={app.id} 
                          className={cn(
                            "p-3 rounded-xl shadow-sm border-2 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5", 
                            app.color
                          )}
                        >
                          <div className="font-semibold text-sm leading-tight mb-1">{app.serviceName}</div>
                          <div className="text-xs leading-tight mb-2 opacity-75">
                            {format(app.startTime, "h:mm a")} - {format(app.endTime, "h:mm a")}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Avatar className="h-5 w-5 ring-2 ring-white shadow-sm">
                              <AvatarImage src="/placeholder.svg?height=20&width=20" alt={app.clientName} />
                              <AvatarFallback className="text-xs font-medium">
                                {app.clientName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{app.clientName}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-sm text-gray-400 dark:text-gray-600 italic">
                        No appointments
                      </span>
                    </div>
                  )}
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}