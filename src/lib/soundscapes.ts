// Soundscapes — ambient audio for focus, sleep, calm, and relief.
export interface Soundscape {
  id: string;
  title: string;
  emoji: string;
  youtubeId: string; // YouTube video ID for the ambient audio
  duration: string;
  mood: "calm" | "focus" | "sleep" | "energy" | "relief";
  description: string;
}

export const SOUNDSCAPES: Soundscape[] = [
  {
    id: "ss1",
    title: "Rain on Window",
    emoji: "🌧️",
    youtubeId: "mPZkdNFkNps",
    duration: "3:00:00",
    mood: "sleep",
    description: "Steady rain tapping on glass — perfect for deep sleep.",
  },
  {
    id: "ss2",
    title: "Ocean Waves",
    emoji: "🌊",
    youtubeId: "JekUNGo-RVk",
    duration: "8:00:00",
    mood: "calm",
    description: "Gentle waves rolling onto a sandy shore.",
  },
  {
    id: "ss3",
    title: "Forest Stream",
    emoji: "🌲",
    youtubeId: "AhU4AjzqT9g",
    duration: "3:00:00",
    mood: "focus",
    description: "Babbling brook through a peaceful woodland.",
  },
  {
    id: "ss4",
    title: "Thunderstorm",
    emoji: "⛈️",
    youtubeId: "gVKEM4K8J8A",
    duration: "10:00:00",
    mood: "sleep",
    description: "Deep rumbles and steady rain for deep relaxation.",
  },
  {
    id: "ss5",
    title: "White Noise",
    emoji: "🤍",
    youtubeId: "yLOM8R6lbzg",
    duration: "10:00:00",
    mood: "focus",
    description: "Consistent ambient noise to block distractions.",
  },
  {
    id: "ss6",
    title: "Summer Night",
    emoji: "🦗",
    youtubeId: "7GoXVDH656g",
    duration: "8:00:00",
    mood: "calm",
    description: "Crickets and gentle night ambience.",
  },
  {
    id: "ss7",
    title: "Crackling Fireplace",
    emoji: "🔥",
    youtubeId: "mSX3OyW9Rao",
    duration: "3:00:00",
    mood: "relief",
    description: "Warm fireplace sounds for cosy comfort during your period.",
  },
  {
    id: "ss8",
    title: "Calm Piano & Rain",
    emoji: "🎹",
    youtubeId: "o8GrqUSdzi0",
    duration: "2:00:00",
    mood: "calm",
    description: "Soft piano melodies blended with gentle rainfall.",
  },
];

// Daily affirmations — rotating emotional support messages
export const DAILY_AFFIRMATIONS: string[] = [
  "I listen to my body with kindness and patience.",
  "My cycle is a source of wisdom, not weakness.",
  "Rest is productive. I give myself permission to slow down.",
  "My body knows exactly what it's doing. I trust it.",
  "I am allowed to take up space and honour my needs.",
  "Every phase of my cycle serves a purpose. I embrace it all.",
  "I deserve care, comfort, and compassion — especially from myself.",
  "My energy ebbs and flows, and that is perfectly natural.",
  "I am stronger than I know, softer than I think, and exactly where I need to be.",
  "Today I choose one small act of kindness for myself.",
  "My feelings are valid. I allow them to move through me.",
  "I am worthy of rest, pleasure, and peace.",
];

export function getDailyAffirmation(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_AFFIRMATIONS[dayOfYear % DAILY_AFFIRMATIONS.length];
}
