import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isDemoModeActive } from '@/lib/supabase';

type MoodEntry = {
  id?: string;
  mood: number;
  timestamp: string;
  note?: string;
  user_id?: string;
};

type AppContextType = {
  streak: number;
  completedSessions: number;
  currentMood: number | null;
  moodEntries: MoodEntry[];
  setCurrentMood: (mood: number) => void;
  addCompletedSession: () => void;
  addMoodEntry: (entry: MoodEntry) => Promise<void>;
  resetAppData: () => void;
  isLoading: boolean;
};

const AppContext = createContext<AppContextType>({
  streak: 0,
  completedSessions: 0,
  currentMood: null,
  moodEntries: [],
  setCurrentMood: () => {},
  addCompletedSession: () => {},
  addMoodEntry: async () => {},
  resetAppData: () => {},
  isLoading: true,
});

export const useAppContext = () => useContext(AppContext);

type AppProviderProps = {
  children: React.ReactNode;
};

// Demo data for when Supabase is not configured
const DEMO_MOOD_ENTRIES: MoodEntry[] = [
  { id: '1', mood: 4, timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Feeling good after morning meditation' },
  { id: '2', mood: 3, timestamp: new Date(Date.now() - 172800000).toISOString(), note: 'Neutral day' },
  { id: '3', mood: 5, timestamp: new Date(Date.now() - 259200000).toISOString(), note: 'Excellent focus session!' },
  { id: '4', mood: 2, timestamp: new Date(Date.now() - 345600000).toISOString(), note: 'Stressed day' },
  { id: '5', mood: 4, timestamp: new Date(Date.now() - 432000000).toISOString(), note: 'Better after focus time' },
];

export function AppProvider({ children }: AppProviderProps) {
  const [streak, setStreak] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<string | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(false);
  
  useEffect(() => {
    mounted.current = true;
    loadData();
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadData = async () => {
    if (!mounted.current) return;
    
    try {
      setIsLoading(true);
      
      // Load local data
      const [savedStreak, savedLastSessionDate, savedCompletedSessions, savedCurrentMood] = 
        await Promise.all([
          AsyncStorage.getItem('streak'),
          AsyncStorage.getItem('lastSessionDate'),
          AsyncStorage.getItem('completedSessions'),
          AsyncStorage.getItem('currentMood'),
        ]);

      if (mounted.current) {
        setStreak(savedStreak ? parseInt(savedStreak) : (isDemoModeActive ? 7 : 0));
        setLastSessionDate(savedLastSessionDate || (isDemoModeActive ? new Date().toISOString().split('T')[0] : null));
        setCompletedSessions(savedCompletedSessions ? parseInt(savedCompletedSessions) : (isDemoModeActive ? 15 : 0));
        setCurrentMood(savedCurrentMood ? parseInt(savedCurrentMood) : (isDemoModeActive ? 4 : null));
      }

      if (isDemoModeActive) {
        // Use demo data
        if (mounted.current) {
          setMoodEntries(DEMO_MOOD_ENTRIES);
        }
      } else {
        // Load mood entries from Supabase
        try {
          const { data: moodData, error } = await supabase
            .from('mood_entries')
            .select('*')
            .order('timestamp', { ascending: false });

          if (error) {
            console.error('Error fetching mood entries:', error);
          } else if (mounted.current) {
            setMoodEntries(moodData || []);
          }
        } catch (error) {
          console.error('Supabase connection error:', error);
          // Fallback to demo data
          if (mounted.current) {
            setMoodEntries(DEMO_MOOD_ENTRIES);
          }
        }
      }

      // Check streak
      if (savedLastSessionDate && mounted.current) {
        const lastDate = new Date(savedLastSessionDate);
        const today = new Date();
        const diffInDays = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffInDays > 1 && !isDemoModeActive) {
          setStreak(0);
          await AsyncStorage.setItem('streak', '0');
        }
      }
    } catch (error) {
      console.error('Failed to load app data:', error);
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };
  
  const updateCurrentMood = async (mood: number) => {
    if (!mounted.current) return;
    
    setCurrentMood(mood);
    try {
      await AsyncStorage.setItem('currentMood', mood.toString());
    } catch (error) {
      console.error('Failed to save current mood:', error);
    }
  };
  
  const addCompletedSession = async () => {
    if (!mounted.current) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      await AsyncStorage.setItem('completedSessions', newCompletedSessions.toString());
      
      if (lastSessionDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        if (lastSessionDate === yesterdayString || lastSessionDate === null) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          await AsyncStorage.setItem('streak', newStreak.toString());
        } else if (lastSessionDate !== today) {
          setStreak(1);
          await AsyncStorage.setItem('streak', '1');
        }
        
        setLastSessionDate(today);
        await AsyncStorage.setItem('lastSessionDate', today);
      }

      if (!isDemoModeActive) {
        // Save session to Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('focus_sessions')
              .insert([{ 
                completed_at: new Date().toISOString(),
                user_id: user.id 
              }]);

            if (error) {
              console.error('Error saving focus session:', error);
            }
          }
        } catch (error) {
          console.error('Supabase error saving session:', error);
        }
      }
    } catch (error) {
      console.error('Failed to update session data:', error);
    }
  };
  
  const addMoodEntry = async (entry: MoodEntry) => {
    if (!mounted.current) return;
    
    try {
      const newEntry = {
        ...entry,
        id: entry.id || Date.now().toString(),
        timestamp: entry.timestamp || new Date().toISOString(),
      };

      if (!isDemoModeActive) {
        // Save to Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const entryWithUserId = {
              ...newEntry,
              user_id: user.id
            };

            const { data, error } = await supabase
              .from('mood_entries')
              .insert([entryWithUserId])
              .select()
              .single();

            if (error) {
              console.error('Error adding mood entry:', error);
              // Still add locally even if Supabase fails
            } else {
              newEntry.id = data.id;
            }
          }
        } catch (error) {
          console.error('Supabase error adding mood entry:', error);
        }
      }

      if (mounted.current) {
        const updatedEntries = [newEntry, ...moodEntries];
        setMoodEntries(updatedEntries);
      }
    } catch (error) {
      console.error('Failed to add mood entry:', error);
    }
  };
  
  const resetAppData = async () => {
    if (!mounted.current) return;
    
    try {
      await AsyncStorage.multiRemove([
        'streak',
        'lastSessionDate',
        'completedSessions',
        'currentMood',
      ]);
      
      if (mounted.current) {
        setStreak(0);
        setLastSessionDate(null);
        setCompletedSessions(0);
        setCurrentMood(null);
        setMoodEntries([]);
      }

      if (!isDemoModeActive) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Clear Supabase data for the current user only
            await supabase
              .from('mood_entries')
              .delete()
              .eq('user_id', user.id);
            
            await supabase
              .from('focus_sessions')
              .delete()
              .eq('user_id', user.id);
          }
        } catch (error) {
          console.error('Supabase error resetting data:', error);
        }
      }
    } catch (error) {
      console.error('Failed to reset app data:', error);
    }
  };
  
  return (
    <AppContext.Provider
      value={{
        streak,
        completedSessions,
        currentMood,
        moodEntries,
        setCurrentMood: updateCurrentMood,
        addCompletedSession,
        addMoodEntry,
        resetAppData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}