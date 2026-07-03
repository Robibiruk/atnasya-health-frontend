// Yoga video library — YouTube-embeddable guided routines for cycle phases + period relief.
// Replace these placeholder IDs with actual curated YouTube video IDs.

export interface YogaVideo {
  id: string;
  title: string;
  duration: string;
  youtubeId: string; // YouTube video ID (the v= part)
  phase: string;
  description: string;
  thumbnail: string;
}

// --- PERIOD RELIEF (quick 5-10 min targeted exercises) ---
export const PERIOD_RELIEF_VIDEOS: YogaVideo[] = [
  {
    id: "pr1",
    title: "5-Minute Cramp Relief",
    duration: "5:00",
    youtubeId: "39C4W1AmOoE",
    phase: "menstrual",
    description: "Gentle stretches to ease menstrual cramps and lower back tension.",
    thumbnail: "🌸",
  },
  {
    id: "pr2",
    title: "Period Pain Yoga Flow",
    duration: "10:00",
    youtubeId: "5d7c7Id9mGc",
    phase: "menstrual",
    description: "A slow, nurturing flow for your period days.",
    thumbnail: "🧘",
  },
  {
    id: "pr3",
    title: "Lower Back Release",
    duration: "7:00",
    youtubeId: "FA7K_1AP1gc",
    phase: "menstrual",
    description: "Release tension in your lower back and hips during menstruation.",
    thumbnail: "💆",
  },
  {
    id: "pr4",
    title: "Bloating & Gas Relief",
    duration: "6:00",
    youtubeId: "IvAx7q2LKqk",
    phase: "luteal",
    description: "Gentle twists and poses to relieve bloating and discomfort.",
    thumbnail: "🌀",
  },
  {
    id: "pr5",
    title: "PMS Anxiety Reset",
    duration: "8:00",
    youtubeId: "oZl9MZPncBM",
    phase: "luteal",
    description: "Calming yoga sequence for PMS-related anxiety and irritability.",
    thumbnail: "🌙",
  },
];

// --- PHASE-SPECIFIC YOGA VIDEOS ---
export const PHASE_YOGA_VIDEOS: YogaVideo[] = [
  {
    id: "yv1",
    title: "Restorative Yoga for Period",
    duration: "15:00",
    youtubeId: "mAfeBaDMN0c",
    phase: "menstrual",
    description: "Complete restorative practice for your menstrual phase.",
    thumbnail: "🌸",
  },
  {
    id: "yv2",
    title: "Energizing Morning Flow",
    duration: "12:00",
    youtubeId: "iWUaZfR-gWU",
    phase: "follicular",
    description: "Match your rising energy with this invigorating flow.",
    thumbnail: "☀️",
  },
  {
    id: "yv3",
    title: "Hip Opening for Fertility",
    duration: "20:00",
    youtubeId: "I7XLX-fcPmE",
    phase: "fertile",
    description: "Deep hip openers to support pelvic health during fertile window.",
    thumbnail: "🌿",
  },
  {
    id: "yv4",
    title: "Ovulation Energy Flow",
    duration: "15:00",
    youtubeId: "sFMeYz_DbGM",
    phase: "ovulation",
    description: "Harness your peak energy with this dynamic practice.",
    thumbnail: "✨",
  },
  {
    id: "yv5",
    title: "Slow Wind-Down Yoga",
    duration: "20:00",
    youtubeId: "p3EJuBxEjt0",
    phase: "luteal",
    description: "Gentle yin-style practice for the pre-period phase.",
    thumbnail: "🌙",
  },
  {
    id: "yv6",
    title: "Prenatal Gentle Yoga",
    duration: "25:00",
    youtubeId: "-3bvlFKeLRE",
    phase: "pregnancy",
    description: "Safe prenatal practice for all trimesters.",
    thumbnail: "🤰",
  },
  {
    id: "yv7",
    title: "Postpartum Recovery Flow",
    duration: "15:00",
    youtubeId: "ue4wcRcRGik",
    phase: "postpartum",
    description: "Gentle core and pelvic floor reconnection after birth.",
    thumbnail: "👶",
  },
];

// Combine all videos
export const ALL_YOGA_VIDEOS = [...PERIOD_RELIEF_VIDEOS, ...PHASE_YOGA_VIDEOS];
