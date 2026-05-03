import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./calendar-item.module.css";
import topbarStyles from "../../topbar.module.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface CalendarItemProps {
  time: Date;
}

export const CalendarItem: React.FC<CalendarItemProps> = ({ time }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      setViewMonth(new Date().getMonth());
      setViewYear(new Date().getFullYear());
    }
    setIsOpen((o) => !o);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const buildDays = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === viewMonth && today.getFullYear() === viewYear;
    const todayDate = today.getDate();

    const cells: { day: number | null; isToday: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, isToday: isCurrentMonth && d === todayDate });
    }
    return cells;
  };

  const formatDateTime = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formattedTime = time.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
    return `${days[time.getDay()]} ${months[time.getMonth()]} ${time.getDate()} ${formattedTime}`;
  };

  const calDays = buildDays();

  return (
    <div className={styles.calendarMenu} ref={ref}>
      <span
        className={`${topbarStyles.menuItem} ${isOpen ? styles.calendarActive : ""}`}
        data-cursor-mode="pointer"
        onClick={handleToggle}
      >
        {formatDateTime()}
      </span>

      {isOpen && (
        <div className={styles.calendarDropdown}>
          <div className={styles.calNav}>
            <button className={styles.calNavBtn} onClick={prevMonth} data-cursor-mode="pointer" aria-label="Previous month">
              <ChevronLeft size={13} />
            </button>
            <span className={styles.calMonthLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button className={styles.calNavBtn} onClick={nextMonth} data-cursor-mode="pointer" aria-label="Next month">
              <ChevronRight size={13} />
            </button>
          </div>

          <div className={styles.calGrid}>
            {DAY_HEADERS.map((d) => (
              <div key={d} className={styles.calDayHeader}>{d}</div>
            ))}
            {calDays.map((cell, i) => (
              <div
                key={i}
                className={`${styles.calDay} ${cell.isToday ? styles.today : ""} ${cell.day === null ? styles.calEmpty : ""}`}
              >
                {cell.day ?? ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
