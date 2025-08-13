"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { format, endOfWeek } from "date-fns"

interface WeekNavigationProps {
  currentWeekStart: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
  onToday: () => void
}

export function WeekNavigation({ currentWeekStart, onPreviousWeek, onNextWeek, onToday }: WeekNavigationProps) {
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 }) // Monday as start of week

  const formattedWeekRange = `${format(currentWeekStart, "MMM dd")} - ${format(weekEnd, "MMM dd, yyyy")}`

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousWeek} className="rounded-md bg-transparent">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Week</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onNextWeek} className="rounded-md bg-transparent">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Week</span>
        </Button>
        <Button variant="outline" onClick={onToday} className="hidden sm:inline-flex rounded-md bg-transparent">
          <CalendarDays className="h-4 w-4 mr-2" />
          Today
        </Button>
      </div>
      <h2 className="text-lg font-semibold text-center flex-1 sm:flex-none">{formattedWeekRange}</h2>
      <Button variant="outline" onClick={onToday} className="sm:hidden rounded-md bg-transparent">
        <CalendarDays className="h-4 w-4 mr-2" />
        Today
      </Button>
    </div>
  )
}
