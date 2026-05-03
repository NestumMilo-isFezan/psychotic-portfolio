import { useState, useEffect } from "react";
import {
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaBolt,
} from "react-icons/fa6";
import styles from "./battery-item.module.css";

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: "levelchange" | "chargingchange", listener: () => void): void;
  removeEventListener(type: "levelchange" | "chargingchange", listener: () => void): void;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

const getBatteryIcon = (level: number, charging: boolean) => {
  if (charging) return <FaBolt size={13} />;
  if (level > 0.75) return <FaBatteryFull size={16} />;
  if (level > 0.5) return <FaBatteryThreeQuarters size={16} />;
  if (level > 0.25) return <FaBatteryHalf size={16} />;
  if (level > 0.1) return <FaBatteryQuarter size={16} />;
  return <FaBatteryEmpty size={16} />;
};

export const BatteryItem: React.FC = () => {
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!navigator.getBattery) {
      setSupported(false);
      return;
    }

    let battery: BatteryManager | null = null;

    const onLevelChange = () => {
      if (battery) setLevel(battery.level);
    };
    const onChargingChange = () => {
      if (battery) setCharging(battery.charging);
    };

    void navigator.getBattery().then((bat) => {
      battery = bat;
      setLevel(bat.level);
      setCharging(bat.charging);
      bat.addEventListener("levelchange", onLevelChange);
      bat.addEventListener("chargingchange", onChargingChange);
    });

    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", onLevelChange);
        battery.removeEventListener("chargingchange", onChargingChange);
      }
    };
  }, []);

  const pct = level !== null ? Math.round(level * 100) : null;
  const isLow = level !== null && level < 0.2 && !charging;

  const className = `${styles.battery} ${charging ? styles.charging : ""} ${isLow ? styles.low : ""}`;

  return (
    <span className={className} data-cursor-mode="pointer">
      {getBatteryIcon(level ?? 1, charging)}
      {supported ? (pct !== null ? `${pct}%` : "–%") : "–%"}
    </span>
  );
};
