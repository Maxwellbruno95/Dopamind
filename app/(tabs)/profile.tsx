import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAppContext } from '@/context/AppContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Moon, Sun, Award, Clock, Brain, Zap, ChevronRight, Settings } from 'lucide-react-native';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const { streak, completedSessions, moodEntries } = useAppContext();
  const { tier } = useSubscription();
  const isDark = theme === 'dark';

  const achievements = [
    {
      id: 1,
      title: 'Focus Master',
      description: 'Complete 100 focus sessions',
      progress: Math.min((completedSessions / 100) * 100, 100),
      icon: Brain,
    },
    {
      id: 2,
      title: 'Consistency King',
      description: 'Maintain a 30-day streak',
      progress: Math.min((streak / 30) * 100, 100),
      icon: Zap,
    },
    {
      id: 3,
      title: 'Time Lord',
      description: 'Accumulate 24 hours of focus time',
      progress: Math.min((completedSessions * 25 / (24 * 60)) * 100, 100),
      icon: Clock,
    },
  ];

  const stats = [
    {
      title: 'Focus Sessions',
      value: completedSessions,
      unit: 'sessions',
    },
    {
      title: 'Current Streak',
      value: streak,
      unit: 'days',
    },
    {
      title: 'Mood Entries',
      value: moodEntries.length,
      unit: 'entries',
    },
    {
      title: 'Focus Time',
      value: Math.round(completedSessions * 25 / 60),
      unit: 'hours',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
              style={styles.avatar}
            />
            <View style={styles.headerText}>
              <Text style={[styles.name, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                John Doe
              </Text>
              <Text style={[styles.tier, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.themeToggle, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}
            onPress={toggleTheme}
          >
            {isDark ? (
              <Moon size={20} color="#FFFFFF" />
            ) : (
              <Sun size={20} color="#0F172A" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View 
              key={index}
              style={[
                styles.statCard,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
              ]}
            >
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {stat.title}
              </Text>
              <Text style={[styles.statUnit, { color: isDark ? '#CBD5E1' : '#94A3B8' }]}>
                {stat.unit}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          Achievements
        </Text>

        <View style={styles.achievementsContainer}>
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
                ]}
              >
                <View style={styles.achievementHeader}>
                  <View style={[
                    styles.achievementIcon,
                    { backgroundColor: isDark ? '#334155' : '#F1F5F9' }
                  ]}>
                    <Icon size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={[
                      styles.achievementTitle,
                      { color: isDark ? '#FFFFFF' : '#0F172A' }
                    ]}>
                      {achievement.title}
                    </Text>
                    <Text style={[
                      styles.achievementDescription,
                      { color: isDark ? '#94A3B8' : '#64748B' }
                    ]}>
                      {achievement.description}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.progressBar,
                  { backgroundColor: isDark ? '#334155' : '#E2E8F0' }
                ]}>
                  <View
                    style={[
                      styles.progressFill,
                      { 
                        width: `${achievement.progress}%`,
                        backgroundColor: '#10B981'
                      }
                    ]}
                  />
                </View>
                <Text style={[
                  styles.progressText,
                  { color: isDark ? '#94A3B8' : '#64748B' }
                ]}>
                  {Math.round(achievement.progress)}% Complete
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.settingsButton,
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
          ]}
          onPress={() => router.push('/settings')}
        >
          <Settings size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
          <Text style={[
            styles.settingsText,
            { color: isDark ? '#FFFFFF' : '#0F172A' }
          ]}>
            Settings
          </Text>
          <ChevronRight size={20} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  headerText: {
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  tier: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    margin: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  achievementCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
});