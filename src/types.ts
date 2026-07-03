// Shared TypeScript interfaces for the Atnasya Health Tracker frontend.
// Mirrors the backend types.ts for client-side type safety.

export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "fertile"
  | "ovulation"
  | "luteal"
  | "unknown";

export interface CycleEntry {
  _id: string;
  userId: string;
  periodStart: string;
  periodEnd: string | null;
  cycleLength: number | null;
  ovulationDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CyclePrediction {
  nextPeriod: string;
  ovulationDay: string;
  fertileStart: string;
  fertileEnd: string;
  avgLength: number;
}

export interface PredictionResponse {
  prediction: CyclePrediction | null;
  phase: CyclePhase;
  dayOfCycle: number | null;
  regularity: number | null;
}

export interface SymptomItem {
  name: string;
  intensity: number;
}

export interface SymptomEntry {
  _id: string;
  userId: string;
  date: string;
  items: SymptomItem[];
  cyclePhase: string;
}

export interface VitalEntry {
  _id: string;
  userId: string;
  date: string;
  bp: { systolic: number; diastolic: number } | null;
  bloodSugar: { value: number; unit: string; timing: string } | null;
  weight: { value: number; unit: string } | null;
  cyclePhase: string;
}

export interface MoodEntry {
  _id: string;
  userId: string;
  date: string;
  score: number;
  emoji: string;
  note: string | null;
}

export type InsightCardType = "cycle" | "vitals" | "wellness";

export interface InsightCard {
  cardType: InsightCardType;
  emoji: string;
  title: string;
  body: string;
}

export interface InsightEntry {
  _id: string;
  userId: string;
  date: string;
  cards: InsightCard[];
  liked: number[];
}

export interface ChatMessage {
  _id: string;
  userId: string;
  sender: "user" | "assistant" | "partner";
  message: string;
  encrypted: boolean;
  createdAt: string;
}

export type OnboardingGoal =
  | "track"
  | "conceive"
  | "avoid"
  | "wellness"
  | "understand";

export interface NotificationPrefs {
  periodReminders: boolean;
  ovulationAlerts: boolean;
  dailyLogReminder: boolean;
}

export interface UserProfile {
  firebaseUid: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
  goal: OnboardingGoal;
  birthYear: number | null;
  onboarding: {
    periodLength: number | null;
    cycleLength: number | null;
    pregnant: boolean | null;
  };
  notificationPrefs: NotificationPrefs;
  settings: {
    theme: "light" | "dark";
    anonymousMode: boolean;
    notifications: boolean;
    unit: "metric" | "imperial";
  };
}

// API envelope
export interface ApiSuccess<T> {
  success: true;
  data: T;
}
export interface ApiError {
  success: false;
  error: string;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface CalendarDay {
  date: string;
  phase: CyclePhase;
}

export interface SelfcareEntry {
  _id: string;
  userId: string;
  date: string;
  mood: number | null;
  water: number | null;
  sleep: number | null;
  energy: number | null;
  notes: string | null;
  createdAt: string;
}

export interface SelfcareCard {
  date: string;
  mood: number | null;
  water: number | null;
  sleep: number | null;
  energy: number | null;
  notes: string | null;
}

export interface SelfcareSummary {
  totalEntries: number;
  avgMood: number | null;
  avgWater: number | null;
  avgSleep: number | null;
  avgEnergy: number | null;
  moodStreak: number;
  waterStreak: number;
  sleepStreak: number;
}

export interface SelfcareInput {
  date: string;
  mood: number | null;
  water: number | null;
  sleep: number | null;
  energy: number | null;
  notes: string | null;
}

// ========== PREGNANCY MODE ==========
export type Trimester = "first" | "second" | "third";

export interface PregnancyEntry {
  _id?: string;
  userId?: string;
  dueDate: string;
  currentWeek: number;
  trimester: Trimester;
  babySize?: string;
  nextMilestone?: string;
  lastKickCount?: { count: number; date: string };
  appointments?: PregnancyAppointment[];
  weightLog?: PregnancyWeightLog[];
}

export interface PregnancyAppointment {
  id: string;
  title: string;
  date: string;
  notes?: string;
}

export interface PregnancyWeightLog {
  date: string;
  weight: number;
}

export interface KickCountEntry {
  _id?: string;
  userId?: string;
  date: string;
  time: string;
  count: number;
  duration: number;
}

// ========== WELLNESS / SELF-CARE ==========
export interface DailyTip {
  id: string;
  tip: string;
  phase: CyclePhase;
  category: string;
}

export interface WellnessArticle {
  id: string;
  title: string;
  category: "nutrition" | "exercise" | "myths" | "general";
  summary: string;
  content: string;
  readTime: number;
}

export interface GuidedBreathing {
  id: string;
  name: string;
  pattern: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
  description: string;
  color: string;
}

export interface Meditation {
  id: string;
  title: string;
  duration: number;
  phase: CyclePhase | "pregnancy" | "postpartum" | "any";
  description: string;
  color: string;
}

export interface YogaRoutine {
  id: string;
  title: string;
  duration: number;
  phase: CyclePhase | "pregnancy" | "postpartum";
  description: string;
  poses: string[];
  color: string;
}

export interface SleepStory {
  id: string;
  title: string;
  duration: number;
  narrator: string;
  theme: string;
  description: string;
}

export interface NutritionSuggestion {
  id: string;
  phase: CyclePhase | "pregnancy" | "postpartum";
  title: string;
  foods: string[];
  benefits: string;
}

export interface MoodTriggeredContent {
  id: string;
  moodThreshold: number;
  title: string;
  body: string;
  type: "breathing" | "meditation" | "tip" | "yoga";
  refId: string;
}

export interface SelfCareReminder {
  id: string;
  type: "hydration" | "medication" | "stretch" | "rest" | "custom";
  title: string;
  time: string;
  days: number[];
  enabled: boolean;
  phaseSpecific?: CyclePhase;
}

export interface TrimesterChecklistItem {
  id: string;
  trimester: Trimester;
  category: string;
  item: string;
  done: boolean;
}

export interface PartnerWellnessSummary {
  phase: CyclePhase;
  dayOfCycle: number;
  avgMood: number | null;
  moodTrend: string;
  nextPeriodDays: number;
  selfCareStreak: number;
}

export interface MonthlyWellnessProgress {
  month: string;
  totalEntries: number;
  avgMood: number;
  avgWater: number;
  avgSleep: number;
  avgEnergy: number;
  streak: number;
  topSymptoms: string[];
}

// ========== INTIMACY / MEDICATION LOGGING ==========
export interface IntimacyEntry {
  _id?: string;
  userId?: string;
  date: string;
  protected: boolean;
  notes?: string;
}

export interface MedicationEntry {
  _id?: string;
  userId?: string;
  date: string;
  name: string;
  dosage: string;
  time: string;
  notes?: string;
}

export interface PhotoAttachment {
  _id?: string;
  userId?: string;
  date: string;
  url: string;
  caption?: string;
}

// ========== PREDICTION ACCURACY ==========
export interface PredictionAccuracy {
  predictedDate: string;
  actualDate: string;
  diffDays: number;
  cycleLabel: string;
}

// ========== PROFILE FEATURES ==========
export type TrackingMode = "cycle" | "pregnancy" | "postpartum";
export type AppLanguage = "en" | "es" | "fr" | "ar";

export interface AppPreferences {
  units: "metric" | "imperial";
  theme: "light" | "dark";
  language: AppLanguage;
  biometricLock: boolean;
  dataEncryption: boolean;
}

export interface SubscriptionInfo {
  plan: "free" | "premium" | "lifetime";
  expiresAt: string | null;
  autoRenew: boolean;
}

export interface FAQItem {
  q: string;
  a: string;
  category: string;
}
