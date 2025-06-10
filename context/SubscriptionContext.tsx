import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isDemoModeActive } from '@/lib/supabase';
import { SubscriptionTier, SUBSCRIPTION_FEATURES } from '@/types/subscription';

type SubscriptionContextType = {
  tier: SubscriptionTier;
  isLoading: boolean;
  canUseFeature: (feature: keyof typeof SUBSCRIPTION_FEATURES.free) => boolean;
  remainingSessions: number;
  upgradeSubscription: (newTier: SubscriptionTier) => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: 'free',
  isLoading: true,
  canUseFeature: () => false,
  remainingSessions: 0,
  upgradeSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

type SubscriptionProviderProps = {
  children: React.ReactNode;
};

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [dailySessions, setDailySessions] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    loadSubscription();
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadSubscription = async () => {
    if (!mounted.current) return;
    
    try {
      setIsLoading(true);
      
      if (isDemoModeActive) {
        // Demo mode - simulate a pro subscription
        if (mounted.current) {
          setTier('pro');
          setDailySessions(2); // Simulate some usage
        }
        return;
      }

      // Get user's subscription from Supabase
      try {
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('tier')
          .maybeSingle();

        if (error) {
          console.error('Error loading subscription:', error);
          return;
        }

        if (mounted.current) {
          setTier(subscription?.tier || 'free');
        }

        // Get today's session count
        const today = new Date().toISOString().split('T')[0];
        const { data: sessions, error: sessionsError } = await supabase
          .from('focus_sessions')
          .select('id')
          .gte('completed_at', today);

        if (sessionsError) {
          console.error('Error loading sessions:', sessionsError);
          return;
        }

        if (mounted.current) {
          setDailySessions(sessions?.length || 0);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        // Fallback to demo values
        if (mounted.current) {
          setTier('free');
          setDailySessions(1);
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  const canUseFeature = (feature: keyof typeof SUBSCRIPTION_FEATURES.free): boolean => {
    const features = SUBSCRIPTION_FEATURES[tier];
    return features[feature];
  };

  const getRemainingDailySessions = (): number => {
    const maxSessions = SUBSCRIPTION_FEATURES[tier].maxFocusSessions;
    if (maxSessions === -1) return -1; // Unlimited
    return Math.max(0, maxSessions - dailySessions);
  };

  const upgradeSubscription = async (newTier: SubscriptionTier) => {
    if (!mounted.current) return;
    
    try {
      if (isDemoModeActive) {
        // In demo mode, just update locally
        if (mounted.current) {
          setTier(newTier);
        }
        return;
      }

      const { error } = await supabase
        .from('subscriptions')
        .upsert({ tier: newTier });

      if (error) {
        throw error;
      }

      if (mounted.current) {
        setTier(newTier);
      }
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isLoading,
        canUseFeature,
        remainingSessions: getRemainingDailySessions(),
        upgradeSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}