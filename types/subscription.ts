export type SubscriptionTier = 'free' | 'pro' | 'elite';

export type SubscriptionFeatures = {
  maxFocusSessions: number;
  customDurations: boolean;
  soundscapes: boolean;
  moodAnalytics: boolean;
  streakHistory: number; // Days of history
  themes: boolean;
  offlineMode: boolean;
  coaching: boolean;
};

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    maxFocusSessions: 3,
    customDurations: false,
    soundscapes: false,
    moodAnalytics: false,
    streakHistory: 7,
    themes: false,
    offlineMode: false,
    coaching: false,
  },
  pro: {
    maxFocusSessions: -1, // Unlimited
    customDurations: true,
    soundscapes: true,
    moodAnalytics: true,
    streakHistory: 365,
    themes: true,
    offlineMode: true,
    coaching: false,
  },
  elite: {
    maxFocusSessions: -1,
    customDurations: true,
    soundscapes: true,
    moodAnalytics: true,
    streakHistory: -1, // Unlimited
    themes: true,
    offlineMode: true,
    coaching: true,
  },
};

export const SUBSCRIPTION_PRICES = {
  pro: {
    monthly: 4.99,
    yearly: 39.99,
  },
  elite: {
    monthly: 9.99,
    yearly: 89.99,
  },
};