"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MobileDateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date | undefined) => void
}

export function MobileDateSelector({ selectedDate, onDateChange }: MobileDateSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal rounded-md shadow-sm",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Select a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl shadow-lg">
        <Calendar mode="single" selected={selectedDate} onSelect={onDateChange} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
