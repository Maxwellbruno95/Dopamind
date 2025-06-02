import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppContext } from '@/context/AppContext';
import { Calendar, CirclePlus as PlusCircle } from 'lucide-react-native';
import MoodSelector from '@/components/MoodSelector';
import MoodChart from '@/components/MoodChart';
import MoodCalendar from '@/components/MoodCalendar';

export default function MoodScreen() {
  const { theme } = useTheme();
  const { moodEntries, addMoodEntry, currentMood, setCurrentMood } = useAppContext();
  const isDark = theme === 'dark';
  
  const [note, setNote] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  const saveMoodEntry = () => {
    if (currentMood) {
      addMoodEntry({
        mood: currentMood,
        note,
        timestamp: new Date().toISOString(),
      });
      setNote('');
    }
  };
  
  const lastSevenDays = moodEntries.slice(-7);
  
  const averageMood = lastSevenDays.length > 0
    ? Math.round(lastSevenDays.reduce((acc, entry) => acc + entry.mood, 0) / lastSevenDays.length)
    : 0;
  
  const moodImprovement = lastSevenDays.length >= 2 
    ? Math.round(((lastSevenDays[lastSevenDays.length - 1].mood - lastSevenDays[0].mood) / 5) * 100) 
    : 0;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            Mood Tracker
          </Text>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Calendar size={24} color={isDark ? '#FFFFFF' : '#0F172A'} />
          </TouchableOpacity>
        </View>
        
        {showCalendar ? (
          <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Your Mood Calendar
            </Text>
            <MoodCalendar moodEntries={moodEntries} />
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                How are you feeling today?
              </Text>
              <MoodSelector 
                selectedMood={currentMood} 
                onSelectMood={setCurrentMood}
                showLabels
              />
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveMoodEntry}
              >
                <PlusCircle size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Mood Entry</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Your Mood Trends
              </Text>
              <MoodChart moodEntries={lastSevenDays} />
              
              <View style={styles.insightsContainer}>
                <View style={styles.insightItem}>
                  <Text style={[styles.insightLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Average Mood
                  </Text>
                  <Text style={[styles.insightValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                    {averageMood === 1 ? 'Very Low' : 
                     averageMood === 2 ? 'Low' : 
                     averageMood === 3 ? 'Neutral' : 
                     averageMood === 4 ? 'Good' : 
                     averageMood === 5 ? 'Excellent' : 'No data'}
                  </Text>
                </View>
                
                <View style={styles.insightItem}>
                  <Text style={[styles.insightLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Improvement
                  </Text>
                  <Text 
                    style={[
                      styles.insightValue, 
                      { 
                        color: moodImprovement > 0 
                          ? '#10B981' 
                          : moodImprovement < 0 
                            ? '#EF4444' 
                            : isDark ? '#FFFFFF' : '#0F172A' 
                      }
                    ]}
                  >
                    {moodImprovement > 0 ? `+${moodImprovement}%` : 
                     moodImprovement < 0 ? `${moodImprovement}%` : 
                     moodImprovement === 0 ? 'Stable' : 'No data'}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.insightText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                {moodImprovement > 20 
                  ? 'Your mood has significantly improved this week! Keep up the great work.' 
                  : moodImprovement > 0 
                    ? 'Your mood is trending upward. Focus sessions are helping!' 
                    : moodImprovement < -20 
                      ? 'Your mood has declined significantly. Consider more focus sessions.' 
                      : moodImprovement < 0 
                        ? 'Your mood has slightly declined. Try adding more focus sessions.' 
                        : lastSevenDays.length > 0 
                          ? 'Your mood has been stable this week.' 
                          : 'Not enough data to analyze mood trends yet.'}
              </Text>
            </View>
            
            <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Focus Session Impact
              </Text>
              <Text style={[styles.impactText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                Your mood improves by approximately 30% after completing focus sessions. Regular focus sessions help rebalance dopamine levels and improve your overall wellbeing.
              </Text>
            </View>
          </>
        )}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  calendarButton: {
    padding: 8,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  insightsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 16,
  },
  insightItem: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginTop: 8,
  },
  impactText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
});