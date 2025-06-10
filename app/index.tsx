import { Redirect } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function Index() {
  useFrameworkReady();
  
  const { user, loading, isDemoMode } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
        <ActivityIndicator size="large" color="#10B981" />
        {isDemoMode && (
          <Text style={[styles.demoText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            🎭 Running in demo mode
          </Text>
        )}
      </View>
    );
  }
  
  // Redirect based on auth state
  if (user || isDemoMode) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});