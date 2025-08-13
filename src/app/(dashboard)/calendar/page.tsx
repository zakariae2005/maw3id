import DesktopScheduleCalendar from "@/components/desktop-schedule-calendar";
import MobileScheduleCalendar from "@/components/mobile-schedule-calendar";


export default function Page() {
  return (
    <>
      {/* Mobile Version (hidden on large screens) */}
      <div className="lg:hidden">
        <MobileScheduleCalendar />
      </div>

      {/* Desktop Version (hidden on small screens) */}
      <div className="hidden lg:block">
        <DesktopScheduleCalendar />
      </div>
    </>
  )
}
