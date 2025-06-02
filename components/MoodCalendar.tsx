import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

type MoodEntry = {
  mood: number;
  timestamp: string;
  note?: string;
};

type MoodCalendarProps = {
  moodEntries: MoodEntry[];
};

export default function MoodCalendar({ moodEntries }: MoodCalendarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const getPreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setCurrentMonth(previousMonth);
  };
  
  const getNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Create a map of dates to mood entries
  const moodMap = new Map();
  moodEntries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    moodMap.set(dateKey, entry.mood);
  });
  
  // Get mood for a specific day
  const getMoodForDay = (day: number) => {
    const dateKey = `${year}-${month}-${day}`;
    return moodMap.get(dateKey);
  };
  
  // Get color for mood
  const getMoodColor = (mood: number | undefined) => {
    if (!mood) return isDark ? '#334155' : '#E2E8F0';
    
    switch (mood) {
      case 1: return '#EF4444'; // Very Low
      case 2: return '#F59E0B'; // Low
      case 3: return '#FBBF24'; // Neutral
      case 4: return '#34D399'; // Good
      case 5: return '#10B981'; // Excellent
      default: return isDark ? '#334155' : '#E2E8F0';
    }
  };
  
  // Generate calendar days
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const mood = getMoodForDay(day);
    days.push(
      <View 
        key={day}
        style={[
          styles.day,
          { backgroundColor: getMoodColor(mood) }
        ]}
      >
        <Text 
          style={[
            styles.dayText, 
            { color: mood ? '#FFFFFF' : isDark ? '#FFFFFF' : '#0F172A' }
          ]}
        >
          {day}
        </Text>
      </View>
    );
  }
  
  // Add legend
  const legend = [
    { label: 'Excellent', mood: 5 },
    { label: 'Good', mood: 4 },
    { label: 'Neutral', mood: 3 },
    { label: 'Low', mood: 2 },
    { label: 'Very Low', mood: 1 },
    { label: 'No Data', mood: 0 },
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={getPreviousMonth}>
          <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#0F172A'} />
        </TouchableOpacity>
        
        <Text style={[styles.monthYear, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {monthNames[month]} {year}
        </Text>
        
        <TouchableOpacity onPress={getNextMonth}>
          <ChevronRight size={24} color={isDark ? '#FFFFFF' : '#0F172A'} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekdays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text 
            key={index} 
            style={[styles.weekday, { color: isDark ? '#94A3B8' : '#64748B' }]}
          >
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.daysContainer}>
        {days}
      </View>
      
      <View style={styles.legend}>
        {legend.map((item) => (
          <View key={item.mood} style={styles.legendItem}>
            <View 
              style={[
                styles.legendColor, 
                { backgroundColor: getMoodColor(item.mood === 0 ? undefined : item.mood) }
              ]} 
            />
            <Text style={[styles.legendText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekday: {
    width: 32,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  day: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 16,
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  emptyDay: {
    width: 32,
    height: 32,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});