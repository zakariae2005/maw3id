/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { format, isToday, parseISO, addMinutes, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  weekDates: Date[]
  reservations: any[]
  unavailableSlots: any[]
  onSlotClick: (date: string, time: string) => void
  services: { id: string; name: string }[]
  clients: { id: string; name: string }[]
  displayMode: "week" | "day" // New prop
}

const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = (i % 2) * 30
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}) // 30-minute intervals

export function CalendarView({
  weekDates,
  reservations,
  unavailableSlots,
  onSlotClick,
  services,
  clients,
  displayMode, // Destructure new prop
}: CalendarViewProps) {
  const now = new Date()
  const currentHourMinute = format(now, "HH:mm")

  const getReservationInfo = (date: string, time: string) => {
    const reservation = reservations.find((res) => res.date === date && res.startTime === time)
    if (reservation) {
      const service = services.find((s) => s.id === reservation.serviceId)
      const client = clients.find((c) => c.id === reservation.clientId)
      return { reservation, service, client }
    }
    return null
  }

  const isSlotUnavailable = (date: string, time: string) => {
    const slotDateTime = parseISO(`${date}T${time}:00`)
    return unavailableSlots.some((slot) => {
      const unavailableStart = parseISO(`${slot.date}T${slot.startTime}:00`)
      const unavailableEnd = addMinutes(unavailableStart, slot.duration)
      return (
        isSameDay(slotDateTime, unavailableStart) && slotDateTime >= unavailableStart && slotDateTime < unavailableEnd
      )
    })
  }

  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 h-full">
      {/* Time Axis */}
      <div className="flex flex-col sticky left-0 z-10 bg-background pr-2 pt-[4.5rem] -mt-[4.5rem]">
        {timeSlots.map((time) => (
          <div key={time} className="h-12 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
            {time.endsWith("00") ? time : ""}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div
        className={cn(
          "grid gap-2 overflow-x-auto",
          displayMode === "day" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7",
        )}
      >
        {weekDates.map((date) => {
          const formattedDate = format(date, "yyyy-MM-dd")
          const isCurrentDay = isToday(date)

          return (
            <div key={formattedDate} className="flex flex-col min-w-[150px]">
              {/* Day Header */}
              <div
                className={cn(
                  "sticky top-0 z-10 bg-background p-2 text-center font-semibold border-b",
                  isCurrentDay
                    ? "text-primary border-primary"
                    : "text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
                )}
              >
                <div className="text-sm">{format(date, "EEE")}</div>
                <div className="text-lg">{format(date, "MMM d")}</div>
              </div>

              {/* Time Slots for the Day */}
              <div className="flex flex-col flex-1">
                {timeSlots.map((time) => {
                  const reservationInfo = getReservationInfo(formattedDate, time)
                  const isReserved = !!reservationInfo
                  const isUnavailable = isSlotUnavailable(formattedDate, time)
                  const isPast = new Date(`${formattedDate}T${time}:00`) < now
                  const isCurrentTimeSlot =
                    isCurrentDay &&
                    time ===
                      currentHourMinute.substring(0, 4) +
                        (currentHourMinute.endsWith("00") || currentHourMinute.endsWith("30")
                          ? currentHourMinute.substring(4)
                          : "00")

                  return (
                    <div
                      key={time}
                      className={cn(
                        "relative h-12 border-b border-r border-gray-100 dark:border-gray-900 cursor-pointer flex items-center justify-center text-xs text-gray-500 dark:text-gray-400",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        isCurrentDay && "border-l-2 border-l-transparent",
                        isCurrentDay && isCurrentTimeSlot && "bg-blue-50/50 dark:bg-blue-950/50", // Highlight current time slot
                        isPast && "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed",
                        isUnavailable &&
                          "bg-red-50/50 dark:bg-red-950/50 text-red-700 dark:text-red-300 cursor-not-allowed",
                        isReserved && "bg-primary/10 dark:bg-primary/20 text-primary-foreground/80 font-medium",
                        isCurrentDay && isCurrentTimeSlot && "border-l-primary", // Current day indicator
                      )}
                      onClick={() => !isPast && !isUnavailable && onSlotClick(formattedDate, time)}
                    >
                      {isReserved ? (
                        <div className="p-1 text-center truncate">
                          <div className="font-semibold text-sm text-primary-foreground">
                            {reservationInfo.service?.name}
                          </div>
                          <div className="text-xs text-primary-foreground/70">{reservationInfo.client?.name}</div>
                        </div>
                      ) : (
                        !isPast &&
                        !isUnavailable && (
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">+ Add</span>
                        )
                      )}
                      {isUnavailable && <span className="text-red-700 dark:text-red-300">Unavailable</span>}
                      {isPast && !isReserved && !isUnavailable && (
                        <span className="text-gray-400 dark:text-gray-600">Past</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
