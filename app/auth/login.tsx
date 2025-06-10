import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { supabase, isDemoModeActive } from '@/lib/supabase';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async () => {
    if (isDemoModeActive) {
      // In demo mode, just navigate to the app
      router.replace('/(tabs)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    router.replace('/(tabs)');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Sign in to continue your mindfulness journey
          </Text>
          {isDemoModeActive && (
            <Text style={[styles.demoNotice, { color: '#F59E0B' }]}>
              🎭 Demo Mode - Supabase not configured
            </Text>
          )}
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <Mail size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                placeholder="Email"
                placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isDemoModeActive}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <Lock size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isDemoModeActive}
              />
            </View>
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.button,
              { opacity: loading ? 0.7 : 1 }
            ]}
            onPress={isDemoModeActive ? handleDemoLogin : handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {isDemoModeActive ? 'Continue Demo' : 'Sign In'}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {isDemoModeActive && (
            <View style={styles.demoInfo}>
              <Text style={[styles.demoInfoText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Demo mode is active. To use real authentication, configure your Supabase environment variables.
              </Text>
            </View>
          )}
        </View>
        
        {!isDemoModeActive && (
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Don't have an account?
            </Text>
            <Link href="/auth/register" style={styles.link}>
              <Text style={styles.linkText}>Sign Up</Text>
            </Link>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  demoNotice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginRight: 8,
  },
  demoInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  demoInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: 4,
  },
  link: {
    padding: 4,
  },
  linkText: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});