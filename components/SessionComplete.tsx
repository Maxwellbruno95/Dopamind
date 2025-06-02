import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAppContext } from '@/context/AppContext';
import MoodSelector from './MoodSelector';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

type SessionCompleteProps = {
  onComplete: () => void;
};

export default function SessionComplete({ onComplete }: SessionCompleteProps) {
  const { theme } = useTheme();
  const { currentMood, setCurrentMood, addMoodEntry } = useAppContext();
  const isDark = theme === 'dark';
  
  const [note, setNote] = React.useState('');
  
  const handleComplete = () => {
    if (currentMood) {
      addMoodEntry({
        mood: currentMood,
        note,
        timestamp: new Date().toISOString(),
      });
    }
    onComplete();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <Animated.View 
        style={styles.content}
        entering={FadeIn.delay(300)}
      >
        <Animated.View 
          style={styles.checkContainer}
          entering={FadeInDown.delay(500).springify()}
        >
          <CheckCircle size={80} color="#10B981" />
        </Animated.View>
        
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          Session Complete!
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#CBD5E1' : '#475569' }]}>
          Great job on completing your focus session. How are you feeling now?
        </Text>
        
        <View style={styles.moodContainer}>
          <MoodSelector 
            selectedMood={currentMood} 
            onSelectMood={setCurrentMood}
            showLabels
          />
        </View>
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleComplete}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  checkContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  moodContainer: {
    width: '100%',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});