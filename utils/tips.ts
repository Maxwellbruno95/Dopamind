const tips = [
  "Dopamine fasting isn't about complete deprivation - it's about intentional consumption",
  "Your brain needs 90 minutes to reset dopamine levels after overstimulation",
  "Natural rewards like sunlight and exercise create sustainable dopamine",
  "Every small win builds momentum - celebrate completing sessions",
  "Boredom is your brain's way of encouraging creativity and reflection",
  "Digital detox helps recalibrate your brain's reward system",
  "Focus sessions create space for deep work and authentic connection",
  "Constant notifications trigger dopamine hits that lead to addiction",
  "Mindful tech use means being intentional about when and why you engage",
  "Small habits compound - consistent focus sessions create lasting change"
];

export function getDailyTip(): string {
  // Get a tip based on the current date (to ensure the same tip shows all day)
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const tipIndex = dayOfYear % tips.length;
  
  return tips[tipIndex];
}