import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Svg, { Path, Circle, Line } from 'react-native-svg';

type MoodEntry = {
  mood: number;
  timestamp: string;
  note?: string;
};

type MoodChartProps = {
  moodEntries: MoodEntry[];
};

export default function MoodChart({ moodEntries }: MoodChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const width = Dimensions.get('window').width - 80;
  const height = 150;
  const padding = 20;
  
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
  };
  
  // If no entries, show empty state
  if (moodEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          No mood data recorded yet.
        </Text>
      </View>
    );
  }
  
  // Create points for the chart
  const points = moodEntries.map((entry, index) => {
    const x = (index / (moodEntries.length - 1 || 1)) * chartWidth + padding;
    // Reverse the y-axis so that higher mood = higher on chart
    const y = padding + chartHeight - ((entry.mood - 1) / 4) * chartHeight;
    return { x, y, mood: entry.mood, date: formatDate(entry.timestamp) };
  });
  
  // Create the path for the line
  let path = '';
  points.forEach((point, index) => {
    if (index === 0) {
      path += `M ${point.x} ${point.y}`;
    } else {
      path += ` L ${point.x} ${point.y}`;
    }
  });
  
  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i / 4) * chartHeight;
          return (
            <Line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke={isDark ? '#334155' : '#E2E8F0'}
              strokeWidth={1}
            />
          );
        })}
        
        {/* Mood line */}
        <Path
          d={path}
          fill="none"
          stroke="#10B981"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={5}
            fill="#10B981"
            stroke={isDark ? '#1E293B' : '#FFFFFF'}
            strokeWidth={2}
          />
        ))}
      </Svg>
      
      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {points.map((point, index) => (
          <Text
            key={index}
            style={[styles.xAxisLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}
          >
            {point.date}
          </Text>
        ))}
      </View>
      
      {/* Y-axis labels */}
      <View style={styles.yAxisLabels}>
        <Text style={[styles.yAxisLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Excellent</Text>
        <Text style={[styles.yAxisLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Low</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  yAxisLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    width: 20,
    textAlign: 'center',
    transform: [{ rotate: '-90deg' }],
  },
});