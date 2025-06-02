import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Play, Flame, TrendingUp, Brain } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAppContext } from '@/context/AppContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { getDailyTip } from '@/utils/tips';
import MoodSelector from '@/components/MoodSelector';
import AnimatedGradient from '@/components/AnimatedGradient';
import ProgressChart from '@/components/ProgressChart';
import UpgradeModal from '@/components/UpgradeModal';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { streak, currentMood, setCurrentMood, completedSessions, moodEntries } = useAppContext();
  const { tier, remainingSessions } = useSubscription();
  const isDark = theme === 'dark';
  
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  
  const dailyTip = getDailyTip();
  
  const startSession = () => {
    if (remainingSessions === 0 && tier === 'free') {
      setShowUpgrade(true);
      return;
    }
    router.push('/focus');
  };

  const calculateProgress = () => {
    const weeklyGoal = tier === 'free' ? 21 : 35; // 3 or 5 sessions per day
    return Math.min((completedSessions / weeklyGoal) * 100, 100);
  };

  const averageMood = moodEntries.length > 0
    ? moodEntries.reduce((acc, entry) => acc + entry.mood, 0) / moodEntries.length
    : 0;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Welcome Back
            </Text>
            <View style={styles.streakContainer}>
              <Flame size={20} color="#F59E0B" />
              <Text style={[styles.streakText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {streak} Day Streak
              </Text>
            </View>
          </View>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
            style={styles.avatar}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.sessionButton} 
          onPress={startSession}
        >
          <AnimatedGradient />
          <View style={styles.sessionButtonContent}>
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.sessionButtonText}>Start Focus Session</Text>
          </View>
          {tier === 'free' && remainingSessions >= 0 && (
            <Text style={styles.sessionsRemaining}>
              {remainingSessions} sessions remaining today
            </Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.statHeader}>
              <TrendingUp size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
              <Text style={[styles.statTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Weekly Progress
              </Text>
            </View>
            <ProgressChart progress={calculateProgress()} />
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {completedSessions} sessions this week
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.statHeader}>
              <Brain size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
              <Text style={[styles.statTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Focus Score
              </Text>
            </View>
            <Text style={[styles.focusScore, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {Math.round((streak * 10 + completedSessions * 5 + averageMood * 20) / 3)}
            </Text>
            <Text style={[styles.focusLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {streak > 7 ? 'Excellent' : streak > 3 ? 'Good' : 'Getting Started'}
            </Text>
          </View>
        </View>
        
        <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            How are you feeling?
          </Text>
          <MoodSelector 
            selectedMood={currentMood} 
            onSelectMood={setCurrentMood} 
            showLabels
          />
        </View>
        
        <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            Daily Insight
          </Text>
          <Text style={[styles.tipText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
            {dailyTip}
          </Text>
        </View>
      </ScrollView>

      <UpgradeModal 
        visible={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sessionButton: {
    height: 120,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sessionButtonContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  sessionsRemaining: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  focusScore: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  focusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  tipText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
});