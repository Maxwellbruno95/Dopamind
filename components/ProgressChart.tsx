import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedReaction
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

type ProgressChartProps = {
  progress: number; // 0-100
};

export default function ProgressChart({ progress }: ProgressChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const animatedProgress = useSharedValue(0);
  
  // Animate progress on mount and when it changes
  useAnimatedReaction(
    () => progress,
    (currentProgress) => {
      animatedProgress.value = withSpring(currentProgress, {
        damping: 15,
        stiffness: 100,
      });
    },
    [progress]
  );
  
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          rotate: withTiming(`${(animatedProgress.value / 100) * 360}deg`, { 
            duration: 1000 
          })
        }
      ],
    };
  });
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    };
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? '#334155' : '#E2E8F0'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={[circumference * (progress / 100), circumference]}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        {/* Animated Dot */}
        <Animated.View 
          style={[
            styles.dot,
            { backgroundColor: '#10B981' },
            animatedStyle,
          ]}
        />
      </View>
      
      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
        <Animated.View 
          style={[
            styles.progressFill,
            { backgroundColor: '#10B981' },
            progressStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  dot: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    marginTop: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});