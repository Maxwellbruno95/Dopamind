import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const moods = [
  { value: 1, emoji: '😫', label: 'Very Low' },
  { value: 2, emoji: '😔', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Excellent' },
];

type MoodSelectorProps = {
  selectedMood: number | null;
  onSelectMood: (mood: number) => void;
  showLabels?: boolean;
};

export default function MoodSelector({ 
  selectedMood, 
  onSelectMood,
  showLabels = false,
}: MoodSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <View style={styles.container}>
      {moods.map((mood) => (
        <TouchableOpacity
          key={mood.value}
          style={[
            styles.moodButton,
            { 
              backgroundColor: selectedMood === mood.value 
                ? '#10B981' 
                : isDark ? '#334155' : '#E2E8F0',
              borderColor: selectedMood === mood.value 
                ? '#10B981' 
                : 'transparent',
            }
          ]}
          onPress={() => onSelectMood(mood.value)}
        >
          <Text style={styles.moodEmoji}>
            {mood.emoji}
          </Text>
          {showLabels && (
            <Text 
              style={[
                styles.moodLabel, 
                { 
                  color: selectedMood === mood.value 
                    ? '#FFFFFF' 
                    : isDark ? '#CBD5E1' : '#475569' 
                }
              ]}
            >
              {mood.label}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    marginHorizontal: 4,
    minHeight: 80,
  },
  moodEmoji: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 4,
  },
});