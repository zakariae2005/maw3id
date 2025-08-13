// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { format, parseISO } from "date-fns"
// import { CalendarIcon } from "lucide-react"
// import { cn } from "@/lib/utils"

// interface ReservationFormProps {
//   initialData?: any
//   services: { id: string; name: string }[]
//   clients: { id: string; name: string }[]
//   onSave: (data: any) => void
//   onDelete: (id: string) => void
//   onCancel: () => void
// }

// export function ReservationForm({ initialData, services, clients, onSave, onDelete, onCancel }: ReservationFormProps) {
//   const [id, setId] = useState(initialData?.id || "")
//   const [clientId, setClientId] = useState(initialData?.clientId || "")
//   const [serviceId, setServiceId] = useState(initialData?.serviceId || "")
//   const [date, setDate] = useState<Date | undefined>(initialData?.date ? parseISO(initialData.date) : undefined)
//   const [startTime, setStartTime] = useState(initialData?.startTime || "")
//   const [duration, setDuration] = useState(initialData?.duration?.toString() || "60")
//   const [notes, setNotes] = useState(initialData?.notes || "")

//   useEffect(() => {
//     if (initialData) {
//       setId(initialData.id || "")
//       setClientId(initialData.clientId || "")
//       setServiceId(initialData.serviceId || "")
//       setDate(initialData.date ? parseISO(initialData.date) : undefined)
//       setStartTime(initialData.startTime || "")
//       setDuration(initialData.duration?.toString() || "60")
//       setNotes(initialData.notes || "")
//     } else {
//       // Reset form for new reservation
//       setId("")
//       setClientId("")
//       setServiceId("")
//       setDate(undefined)
//       setStartTime("")
//       setDuration("60")
//       setNotes("")
//     }
//   }, [initialData])

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!clientId || !serviceId || !date || !startTime || !duration) {
//       alert("Please fill all required fields: Client, Service, Date, Start Time, and Duration.")
//       return
//     }

//     const formattedDate = date ? format(date, "yyyy-MM-dd") : ""

//     onSave({
//       id,
//       clientId,
//       serviceId,
//       date: formattedDate,
//       startTime,
//       duration: Number.parseInt(duration),
//       notes,
//     })
//   }

//   const handleDelete = () => {
//     if (id && confirm("Are you sure you want to delete this reservation?")) {
//       onDelete(id)
//     }
//   }

//   const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
//     const hour = Math.floor(i / 2)
//     const minute = (i % 2) * 30
//     return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
//   })

//   const durationOptions = [
//     { value: "30", label: "30 minutes" },
//     { value: "60", label: "1 hour" },
//     { value: "90", label: "1 hour 30 minutes" },
//     { value: "120", label: "2 hours" },
//   ]

//   return (
//     <form onSubmit={handleSubmit} className="grid gap-4 p-4">
//       <div className="grid gap-2">
//         <Label htmlFor="client">Client</Label>
//         <Select value={clientId} onValueChange={setClientId}>
//           <SelectTrigger id="client" className="rounded-md shadow-sm">
//             <SelectValue placeholder="Select a client" />
//           </SelectTrigger>
//           <SelectContent className="rounded-md shadow-lg">
//             {clients.map((client) => (
//               <SelectItem key={client.id} value={client.id}>
//                 {client.name} ({client.phone})
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="grid gap-2">
//         <Label htmlFor="service">Service</Label>
//         <Select value={serviceId} onValueChange={setServiceId}>
//           <SelectTrigger id="service" className="rounded-md shadow-sm">
//             <SelectValue placeholder="Select a service" />
//           </SelectTrigger>
//           <SelectContent className="rounded-md shadow-lg">
//             {services.map((service) => (
//               <SelectItem key={service.id} value={service.id}>
//                 {service.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="grid gap-2">
//         <Label htmlFor="date">Date</Label>
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button
//               variant={"outline"}
//               className={cn(
//                 "w-full justify-start text-left font-normal rounded-md shadow-sm",
//                 !date && "text-muted-foreground",
//               )}
//             >
//               <CalendarIcon className="mr-2 h-4 w-4" />
//               {date ? format(date, "PPP") : <span>Pick a date</span>}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0 rounded-xl shadow-lg">
//             <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
//           </PopoverContent>
//         </Popover>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="grid gap-2">
//           <Label htmlFor="start-time">Start Time</Label>
//           <Select value={startTime} onValueChange={setStartTime}>
//             <SelectTrigger id="start-time" className="rounded-md shadow-sm">
//               <SelectValue placeholder="Select time" />
//             </SelectTrigger>
//             <SelectContent className="rounded-md shadow-lg max-h-60">
//               {timeOptions.map((time) => (
//                 <SelectItem key={time} value={time}>
//                   {time}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="grid gap-2">
//           <Label htmlFor="duration">Duration</Label>
//           <Select value={duration} onValueChange={setDuration}>
//             <SelectTrigger id="duration" className="rounded-md shadow-sm">
//               <SelectValue placeholder="Select duration" />
//             </SelectTrigger>
//             <SelectContent className="rounded-md shadow-lg">
//               {durationOptions.map((opt) => (
//                 <SelectItem key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <div className="grid gap-2">
//         <Label htmlFor="notes">Notes (Optional)</Label>
//         <Textarea
//           id="notes"
//           placeholder="Add any special notes for the reservation..."
//           value={notes}
//           onChange={(e) => setNotes(e.target.value)}
//           className="rounded-md shadow-sm"
//         />
//       </div>

//       <div className="flex flex-col sm:flex-row gap-2 mt-4">
//         <Button type="submit" className="flex-1 rounded-md">
//           {id ? "Save Changes" : "Add Reservation"}
//         </Button>
//         {id && (
//           <Button type="button" variant="destructive" onClick={handleDelete} className="flex-1 rounded-md">
//             Delete Reservation
//           </Button>
//         )}
//         <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-md bg-transparent">
//           Cancel
//         </Button>
//       </div>
//     </form>
//   )
// }
