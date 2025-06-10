import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Use demo/development values if environment variables are not set
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

// For development/demo purposes, we'll create a mock client if no real credentials
const isDemoMode = !process.env.EXPO_PUBLIC_SUPABASE_URL || supabaseUrl === 'https://demo.supabase.co';

if (isDemoMode) {
  console.warn('🚧 Running in demo mode - Supabase features will be mocked');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Mock user for demo mode
export const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@dopamind.app',
  user_metadata: {
    full_name: 'Demo User'
  }
};

export const isDemoModeActive = isDemoMode;