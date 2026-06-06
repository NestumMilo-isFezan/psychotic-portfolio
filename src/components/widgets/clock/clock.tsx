import { useEffect, useState } from "react";
import styles from "./clock.module.css";

export function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dayName = dayNames[time.getDay()];
  const monthName = monthNames[time.getMonth()];
  const day = time.getDate();

  return (
    <div className={styles.clockWidget}>
      <div className={styles.clockDateTop}>
        {dayName}, {monthName} {day}
      </div>
      <div className={styles.clockTime}>
        <span className={styles.clockHours}>{hours}</span>
        <span className={styles.clockSeparator}>:</span>
        <span className={styles.clockMinutes}>{minutes}</span>
      </div>
    </div>
  );
}
