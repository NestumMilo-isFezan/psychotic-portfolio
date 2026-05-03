export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description: string;
}

export const timelineData: TimelineEntry[] = [
  {
    id: "2024-2025",
    date: "2024-2025",
    title: "Software Development Foundations",
    description: "Developed first full-featured software during final-year project",
  },
  {
    id: "2025-mar",
    date: "2025 Mar",
    title: "Internship @ SDLC",
    description: "Gained end-to-end SDLC experience from planning to production",
  },
  {
    id: "2025-sep",
    date: "2025 Sep",
    title: "Full-Stack Developer",
    description: "Started full-time role building enterprise applications",
  },
  {
    id: "2025-nov",
    date: "2025 Nov",
    title: "Linux Explorer",
    description: "Hands-on Linux server administration; deployment pipelines & desktop exploration",
  },
  {
    id: "2026-jan",
    date: "2026 Jan",
    title: "Enterprise Scale Development",
    description: "Built high-volume event-driven software; query optimization, race conditions, React performance",
  },
  {
    id: "2026-feb",
    date: "2026 Feb",
    title: "Motion Website",
    description: "Developed official ambassador website with motion/animation",
  },
  {
    id: "2026-mar",
    date: "2026 Mar",
    title: "Automation Lead",
    description: "Led N8N + WhatsApp Business API integration project",
  },
];