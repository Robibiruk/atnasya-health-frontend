// Wellness data — phase-aware tips, articles, breathing exercises, meditations, yoga, sleep stories, nutrition, mood-triggered content
import type { DailyTip, WellnessArticle, GuidedBreathing, Meditation, YogaRoutine, SleepStory, NutritionSuggestion, MoodTriggeredContent, CyclePhase, Trimester } from "../types";

export const DAILY_TIPS: DailyTip[] = [
  { id: "mt1", tip: "Rest is productive too. Give yourself permission to slow down today.", phase: "menstrual", category: "mindset" },
  { id: "mt2", tip: "Warm compress on your lower belly can ease cramping. Stay cozy.", phase: "menstrual", category: "physical" },
  { id: "mt3", tip: "Iron-rich foods like spinach and lentils help replenish what your body is losing.", phase: "menstrual", category: "nutrition" },
  { id: "ft1", tip: "Your energy is coming back — great time to start something new!", phase: "follicular", category: "mindset" },
  { id: "ft2", tip: "Try a gentle workout. Your body is primed for movement right now.", phase: "follicular", category: "fitness" },
  { id: "ft3", tip: "Skin is loving estrogen right now. Amp up your skincare routine.", phase: "follicular", category: "beauty" },
  { id: "frt1", tip: "Communication is key — your confidence is naturally higher today.", phase: "fertile", category: "mindset" },
  { id: "frt2", tip: "Vitamin C helps absorption. Pair iron-rich foods with citrus.", phase: "fertile", category: "nutrition" },
  { id: "frt3", tip: "You're glowing! Enjoy the extra energy and social confidence.", phase: "fertile", category: "mindset" },
  { id: "ov1", tip: "Today is peak fertility day. Listen to your body's signals.", phase: "ovulation", category: "physical" },
  { id: "ov2", tip: "Your energy and mood are at their peak. Take on that challenge!", phase: "ovulation", category: "mindset" },
  { id: "ov3", tip: "Your skin is radiant — keep it hydrated from the inside out.", phase: "ovulation", category: "beauty" },
  { id: "lt1", tip: "Magnesium-rich foods like dark chocolate and nuts can ease PMS symptoms.", phase: "luteal", category: "nutrition" },
  { id: "lt2", tip: "Be extra kind to yourself. Your body is working hard this week.", phase: "luteal", category: "mindset" },
  { id: "lt3", tip: "Gentle stretching or a warm bath can ease tension and bloating.", phase: "luteal", category: "fitness" },
];

export const WELLNESS_ARTICLES: WellnessArticle[] = [
  { id: "art1", title: "Understanding Your Cycle: A Complete Guide", category: "general", summary: "Learn the four phases of your menstrual cycle and how each affects your body and mood.", content: "Your menstrual cycle is more than just your period. It's a complex hormonal dance that affects your energy, mood, sleep, and overall well-being. Understanding each phase helps you work with your body, not against it.", readTime: 6 },
  { id: "art2", title: "Nutrition by Cycle Phase", category: "nutrition", summary: "What to eat during each phase of your cycle to feel your best and support hormonal balance.", content: "Your nutritional needs change throughout your cycle. During the menstrual phase, focus on iron-rich foods. During the follicular phase, your body is primed for lighter, fresher foods. The luteal phase calls for complex carbs and magnesium-rich foods.", readTime: 8 },
  { id: "art3", title: "Exercise and Your Menstrual Cycle", category: "exercise", summary: "Match your workouts to your cycle phases for better results and less fatigue.", content: "Syncing your exercise routine with your cycle can improve performance and reduce injury risk. High-intensity workouts are best during the follicular and ovulation phases, while gentler movement like yoga and walking suit the luteal and menstrual phases.", readTime: 5 },
  { id: "art4", title: "5 Common Period Myths, Debunked", category: "myths", summary: "Separating fact from fiction about periods, PMS, and cycle tracking.", content: "Myth: You can't get pregnant during your period. Fact: Sperm can live up to 5 days, so if you have a short cycle, conception is possible. Myth: PMS is all in your head. Fact: PMS has real biological causes related to hormonal shifts.", readTime: 4 },
  { id: "art5", title: "The Science of Sleep During Your Cycle", category: "general", summary: "Why your sleep quality changes throughout the month and what to do about it.", content: "Progesterone, which rises after ovulation, can make you feel sleepy but also disrupt deep sleep. During the follicular phase, rising estrogen often means better sleep quality. Track your sleep across your cycle to spot patterns.", readTime: 5 },
  { id: "art6", title: "Hydration: Your Cycle's Best Friend", category: "nutrition", summary: "How much water you really need and why it changes during your cycle.", content: "Dehydration can worsen cramps, headaches, and fatigue during your period. Aim for 8-10 glasses of water daily, and increase intake during the luteal phase when bloating can make you feel dehydrated.", readTime: 3 },
];

export const BREATHING_EXERCISES: GuidedBreathing[] = [
  { id: "b1", name: "Box Breathing", pattern: "4-4-4-4", inhale: 4, hold: 4, exhale: 4, cycles: 8, description: "Equal inhale, hold, exhale, hold. Used by Navy SEALs for calm under pressure.", color: "#6366F1" },
  { id: "b2", name: "4-7-8 Breathing", pattern: "4-7-8", inhale: 4, hold: 7, exhale: 8, cycles: 5, description: "Also called the 'relaxing breath'. Helps with anxiety and falling asleep.", color: "#8B5CF6" },
  { id: "b3", name: "Calming Breath", pattern: "2-4-6", inhale: 2, hold: 4, exhale: 6, cycles: 6, description: "Longer exhales activate the parasympathetic nervous system.", color: "#EC4899" },
  { id: "b4", name: "Energizing Breath", pattern: "4-0-4", inhale: 4, hold: 0, exhale: 4, cycles: 10, description: "Quick, rhythmic breathing to boost alertness without caffeine.", color: "#F59E0B" },
  { id: "b5", name: "PMS Calm", pattern: "4-6-8", inhale: 4, hold: 6, exhale: 8, cycles: 6, description: "Extended exhale session for PMS-related anxiety and irritability.", color: "#E879A0" },
];

export const MEDITATIONS: Meditation[] = [
  { id: "m1", title: "Gentle Morning Awareness", duration: 5, phase: "any", description: "Start your day with clarity and calm.", color: "#6366F1", image: "/illustrations/meditations/Gentle-Morning-Awareness.jpg" },
  { id: "m2", title: "PMS Calm & Soothe", duration: 10, phase: "luteal", description: "For those days when emotions run high.", color: "#E879A0", image: "/illustrations/meditations/PMS-Calm-and-Soothe.jpg" },
  { id: "m3", title: "Period Rest & Recharge", duration: 8, phase: "menstrual", description: "Honor your body's need to rest.", color: "#F59E0B", image: "/illustrations/meditations/Period-Rest-and-Recharge.jpg" },
  { id: "m4", title: "Fertile Ground Meditation", duration: 7, phase: "fertile", description: "Connect with your body's creative energy.", color: "#10B981", image: "/illustrations/meditations/Fertile-Ground-Meditation.jpg" },
  { id: "m5", title: "Pregnancy Relaxation", duration: 15, phase: "pregnancy", description: "Deep relaxation for expectant mothers.", color: "#8B5CF6", image: "/illustrations/meditations/Pregnancy-Relaxation.jpg" },
  { id: "m6", title: "Postpartum Grounding", duration: 10, phase: "postpartum", description: "Gentle grounding after birth.", color: "#EC4899", image: "/illustrations/meditations/Postpartum-Grounding.png" },
  { id: "m7", title: "Ovulation Confidence Boost", duration: 5, phase: "ovulation", description: "Harness your peak confidence and energy.", color: "#F59E0B", image: "/illustrations/meditations/Ovulation-Confidence-Boost.jpg" },
  { id: "m8", title: "Evening Wind-Down", duration: 12, phase: "any", description: "Release the day and prepare for restful sleep.", color: "#6366F1", image: "/illustrations/meditations/Evening-Wind-Down.jpg" },
];

export const YOGA_ROUTINES: YogaRoutine[] = [
  { id: "y1", title: "Period Pain Relief", duration: 10, phase: "menstrual", description: "Gentle stretches to ease cramps and lower back tension.", poses: ["Child's Pose", "Cat-Cow", "Reclining Bound Angle", "Knees-to-Chest", "Savasana"], color: "#F59E0B", image: "/illustrations/yoga/Period-Pain-Relief.jpg" },
  { id: "y2", title: "Follicular Flow", duration: 15, phase: "follicular", description: "Vinyasa flow to match rising energy levels.", poses: ["Sun Salutations A", "Standing Forward Fold", "Low Lunge", "Warrior I", "Seated Twist"], color: "#6366F1", image: "/illustrations/yoga/Follicular-Flow.jpg" },
  { id: "y3", title: "Fertility Yoga", duration: 20, phase: "fertile", description: "Hip-opening sequence to support pelvic health.", poses: ["Bound Angle", "Pigeon Pose", "Garland Pose", "Bridge Pose", "Legs Up the Wall"], color: "#10B981", image: "/illustrations/yoga/Fertility-Yoga.jpg" },
  { id: "y4", title: "Luteal Phase Unwind", duration: 15, phase: "luteal", description: "Slow, grounding practice for PMS relief.", poses: ["Wide-Legged Forward Fold", "Seated Forward Bend", "Supine Twist", "Happy Baby", "Savasana"], color: "#E879A0", image: "/illustrations/yoga/Luteal-Phase-Unwind.jpg" },
  { id: "y5", title: "Pregnancy Gentle Flow", duration: 15, phase: "pregnancy", description: "Safe prenatal yoga for all trimesters.", poses: ["Cat-Cow", "Side Stretch", "Butterfly", "Warrior II (modified)", "Side-Lying Savasana"], color: "#8B5CF6", image: "/illustrations/yoga/Pregnancy-Gentle-Flow.jpg" },
  { id: "y6", title: "Postpartum Recovery", duration: 12, phase: "postpartum", description: "Gentle core and pelvic floor reconnection.", poses: ["Pelvic Tilts", "Bridge (feet together)", "Cat-Cow", "Seated Side Bend", "Savasana"], color: "#EC4899", image: "/illustrations/yoga/Postpartum-Recovery.jpg" },
];

export const SLEEP_STORIES: SleepStory[] = [
  { id: "s1", title: "Moonlit Meadow", duration: 15, narrator: "Luna", theme: "nature", description: "Walk through a peaceful meadow under a full moon.", videoUrl: "https://www.youtube.com/embed/Knw6TYuzIjM" },
  { id: "s2", title: "The Cosy Cabin", duration: 20, narrator: "James", theme: "cosy", description: "Rain falls on a cabin roof as you drift off by the fire.", videoUrl: "https://www.youtube.com/embed/1RcVIuZ8Wdk" },
  { id: "s3", title: "Starlight Voyage", duration: 18, narrator: "Nova", theme: "fantasy", description: "Float through a star-filled galaxy in a warm air balloon.", videoUrl: "https://www.youtube.com/embed/m5EOtKf5qZo" },
  { id: "s4", title: "Gentle Rain Garden", duration: 12, narrator: "Luna", theme: "nature", description: "Explore a Japanese garden in a warm spring rain.", videoUrl: "https://www.youtube.com/embed/v6VNvlWawcU" },
  { id: "s5", title: "Ocean Serenade", duration: 25, narrator: "James", theme: "nature", description: "Drift on calm waves beneath a canopy of stars.", videoUrl: "https://www.youtube.com/embed/8dP0JMa_rqw" },
  { id: "s6", title: "The Enchanted Library", duration: 16, narrator: "Nova", theme: "fantasy", description: "Discover a magical library where every book lulls you to sleep.", videoUrl: "https://www.youtube.com/embed/9lJoqJr9CIc" },
];

export const NUTRITION_SUGGESTIONS: NutritionSuggestion[] = [
  { id: "n1", phase: "menstrual", title: "Iron Boost", foods: ["Spinach", "Lentils", "Lean red meat", "Pumpkin seeds", "Dark chocolate"], benefits: "Replenishes iron lost during menstruation and reduces fatigue." },
  { id: "n2", phase: "follicular", title: "Fresh & Light", foods: ["Berries", "Leafy greens", "Citrus fruits", "Quinoa", "Salmon"], benefits: "Supports rising estrogen with antioxidants and omega-3s." },
  { id: "n3", phase: "fertile", title: "Fertility Support", foods: ["Avocado", "Walnuts", "Whole grains", "Eggs", "Sweet potatoes"], benefits: "Nutrient-dense foods that support reproductive health and energy." },
  { id: "n4", phase: "ovulation", title: "Anti-Inflammatory", foods: ["Turmeric", "Ginger", "Berries", "Green tea", "Olive oil"], benefits: "Reduces inflammation during peak hormonal shift." },
  { id: "n5", phase: "luteal", title: "PMS Relief", foods: ["Dark chocolate", "Bananas", "Oats", "Almonds", "Chamomile tea"], benefits: "Magnesium and B vitamins help ease mood swings and cravings." },
  { id: "n6", phase: "pregnancy", title: "Prenatal Power", foods: ["Folate-rich greens", "Lean protein", "Dairy", "Berries", "Legumes"], benefits: "Key nutrients for fetal development and maternal energy." },
  { id: "n7", phase: "postpartum", title: "Postpartum Recovery", foods: ["Oats", "Salmon", "Leafy greens", "Bone broth", "Nuts"], benefits: "Supports milk production, energy recovery, and tissue repair." },
];

export const MOOD_TRIGGERED_CONTENT: MoodTriggeredContent[] = [
  { id: "mc1", moodThreshold: 2, title: "5-Minute Reset", body: "Close your eyes. Breathe in for 4 counts. Hold for 4. Breathe out for 6. Just 5 minutes can shift your whole day.", type: "breathing", refId: "b1" },
  { id: "mc2", moodThreshold: 2, title: "You're Not Alone", body: "Feeling low is completely normal during this phase. Try this short meditation designed for exactly how you're feeling right now.", type: "meditation", refId: "m2" },
  { id: "mc3", moodThreshold: 3, title: "Quick Energy Boost", body: "A gentle stretch can release tension and lift your spirits. Try this 5-minute routine right where you are.", type: "yoga", refId: "y4" },
  { id: "mc4", moodThreshold: 1, title: "Comfort Care", body: "When everything feels heavy, start small. Drink a glass of water. Wrap up in something warm. This too shall pass.", type: "tip", refId: "mt1" },
  { id: "mc5", moodThreshold: 2, title: "Positive Shift", body: "Your thoughts shape your reality. Take 3 deep breaths and name one thing you're grateful for right now.", type: "meditation", refId: "m1" },
  { id: "mc6", moodThreshold: 2, title: "Stress Melt", body: "This breathing exercise is proven to calm your nervous system in under 3 minutes. Give it a try.", type: "breathing", refId: "b2" },
];

export const TRIMESTER_CHECKLISTS: Record<Trimester, { id: string; category: string; item: string }[]> = {
  first: [
    { id: "t1c1", category: "Health", item: "Schedule first prenatal appointment" },
    { id: "t1c2", category: "Health", item: "Start prenatal vitamins" },
    { id: "t1c3", category: "Health", item: "Discuss morning sickness management with doctor" },
    { id: "t1c4", category: "Wellness", item: "Begin gentle pregnancy exercise routine" },
    { id: "t1c5", category: "Wellness", item: "Track sleep patterns and adjust as needed" },
    { id: "t1c6", category: "Preparation", item: "Research childbirth classes" },
    { id: "t1c7", category: "Preparation", item: "Review health insurance coverage" },
  ],
  second: [
    { id: "t2c1", category: "Health", item: "Schedule anatomy scan ultrasound" },
    { id: "t2c2", category: "Health", item: "Monitor blood pressure regularly" },
    { id: "t2c3", category: "Health", item: "Begin glucose screening prep" },
    { id: "t2c4", category: "Wellness", item: "Continue pregnancy-safe yoga/stretching" },
    { id: "t2c5", category: "Wellness", item: "Set up nursery and baby preparations" },
    { id: "t2c6", category: "Preparation", item: "Create birth plan preferences" },
    { id: "t2c7", category: "Preparation", item: "Tour hospital/birthing center" },
  ],
  third: [
    { id: "t3c1", category: "Health", item: "Schedule weekly prenatal visits" },
    { id: "t3c2", category: "Health", item: "Discuss labor signs with doctor" },
    { id: "t3c3", category: "Health", item: "Finalize pain management plan" },
    { id: "t3c4", category: "Wellness", item: "Rest as much as possible" },
    { id: "t3c5", category: "Wellness", item: "Practice breathing techniques for labor" },
    { id: "t3c6", category: "Preparation", item: "Pack hospital bag" },
    { id: "t3c7", category: "Preparation", item: "Install car seat and finalize nursery" },
  ],
};

/** Get the phase-appropriate tip for a given phase */
export function getPhaseTip(phase: CyclePhase | null): DailyTip | null {
  if (!phase) return null;
  const tips = DAILY_TIPS.filter((t) => t.phase === phase);
  if (!tips.length) return null;
  return tips[Math.floor(Math.random() * tips.length)];
}

/** Get mood-triggered content for a given mood score */
export function getMoodTriggeredContent(mood: number | null): MoodTriggeredContent | null {
  if (mood === null || mood === undefined) return null;
  const eligible = MOOD_TRIGGERED_CONTENT.filter((c) => mood <= c.moodThreshold);
  if (!eligible.length) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/** Get nutrition suggestion for a cycle phase or pregnancy */
export function getNutritionForPhase(phase: CyclePhase | "pregnancy" | "postpartum"): NutritionSuggestion | null {
  const suggestions = NUTRITION_SUGGESTIONS.filter((n) => n.phase === phase);
  if (!suggestions.length) return null;
  return suggestions[0];
}

/** Get yoga for a cycle phase or pregnancy/postpartum */
export function getYogaForPhase(phase: CyclePhase | "pregnancy" | "postpartum"): YogaRoutine | null {
  const routines = YOGA_ROUTINES.filter((y) => y.phase === phase);
  if (!routines.length) return null;
  return routines[Math.floor(Math.random() * routines.length)];
}
