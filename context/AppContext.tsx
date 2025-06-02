import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

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
        if (savedStreak) setStreak(parseInt(savedStreak));
        if (savedLastSessionDate) setLastSessionDate(savedLastSessionDate);
        if (savedCompletedSessions) setCompletedSessions(parseInt(savedCompletedSessions));
        if (savedCurrentMood) setCurrentMood(parseInt(savedCurrentMood));
      }

      // Load mood entries from Supabase
      const { data: moodData, error } = await supabase
        .from('mood_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching mood entries:', error);
      } else if (mounted.current) {
        setMoodEntries(moodData || []);
      }

      // Check streak
      if (savedLastSessionDate && mounted.current) {
        const lastDate = new Date(savedLastSessionDate);
        const today = new Date();
        const diffInDays = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffInDays > 1) {
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

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Save session to Supabase
      const { error } = await supabase
        .from('focus_sessions')
        .insert([{ 
          completed_at: new Date().toISOString(),
          user_id: user.id 
        }]);

      if (error) {
        console.error('Error saving focus session:', error);
      }
    } catch (error) {
      console.error('Failed to update session data:', error);
    }
  };
  
  const addMoodEntry = async (entry: MoodEntry) => {
    if (!mounted.current) return;
    
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add the user_id to the entry
      const entryWithUserId = {
        ...entry,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('mood_entries')
        .insert([entryWithUserId])
        .select()
        .single();

      if (error) {
        console.error('Error adding mood entry:', error);
        return;
      }

      if (mounted.current) {
        const updatedEntries = [data, ...moodEntries];
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

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Clear Supabase data for the current user only
      await supabase
        .from('mood_entries')
        .delete()
        .eq('user_id', user.id);
      
      await supabase
        .from('focus_sessions')
        .delete()
        .eq('user_id', user.id);
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