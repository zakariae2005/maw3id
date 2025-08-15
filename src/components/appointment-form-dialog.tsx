// components/appointment-form-dialog.tsx
"use client"

import { format, startOfDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewAppointment {
  clientName: string
  serviceId: string
  appointmentDate: Date
  startHour: string
  startMinute: string
  duration: string
}

interface Service {
  id: string
  name: string
  price: number
}

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  newAppointment: NewAppointment
  setNewAppointment: React.Dispatch<React.SetStateAction<NewAppointment>>
  services: Service[]
  onSubmit: () => void
  isDesktop?: boolean
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  trigger,
  newAppointment,
  setNewAppointment,
  services,
  onSubmit,
  isDesktop = false,
}: AppointmentFormDialogProps) {
  const darkModeClasses = isDesktop 
    ? "text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" 
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-lg font-semibold ${isDesktop ? 'text-slate-900 dark:text-slate-100' : ''}`}>
            New Appointment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className={`text-sm font-medium ${darkModeClasses}`}>
              Client Name
            </Label>
            <Input
              id="clientName"
              placeholder="Enter client name"
              value={newAppointment.clientName}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
              className={`h-9 ${darkModeClasses}`}
            />
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label htmlFor="serviceName" className={`text-sm font-medium ${darkModeClasses}`}>
              Service Type
            </Label>
            <Select
              value={newAppointment.serviceId}
              onValueChange={(value) => setNewAppointment(prev => ({ ...prev, serviceId: value }))}
            >
              <SelectTrigger className={`h-9 ${darkModeClasses}`}>
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

          {/* Date */}
          <div className="space-y-2">
            <Label className={`text-sm font-medium ${darkModeClasses}`}>
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal h-9 ${darkModeClasses}`}
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

          {/* Time and Duration */}
          <div className="grid grid-cols-3 gap-3">
            {/* Hour */}
            <div className="space-y-2">
              <Label className={`text-xs font-medium ${darkModeClasses}`}>Hour</Label>
              <Select
                value={newAppointment.startHour}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, startHour: value }))}
              >
                <SelectTrigger className={`h-8 text-sm ${darkModeClasses}`}>
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

            {/* Minute */}
            <div className="space-y-2">
              <Label className={`text-xs font-medium ${darkModeClasses}`}>Minute</Label>
              <Select
                value={newAppointment.startMinute}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, startMinute: value }))}
              >
                <SelectTrigger className={`h-8 text-sm ${darkModeClasses}`}>
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

            {/* Duration */}
            <div className="space-y-2">
              <Label className={`text-xs font-medium ${darkModeClasses}`}>Duration</Label>
              <Select
                value={newAppointment.duration}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger className={`h-8 text-sm ${darkModeClasses}`}>
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

          {/* Submit */}
          <Button 
            onClick={onSubmit}
            className={`w-full h-9 bg-slate-900 hover:bg-slate-800 text-white`}
            disabled={!newAppointment.clientName || !newAppointment.serviceId}
          >
            Create Appointment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
