import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, X, Volume2, Volume, Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAppContext } from '@/context/AppContext';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import TimerCircle from '@/components/TimerCircle';
import SessionComplete from '@/components/SessionComplete';

const sessionOptions = [
  { id: 1, label: '25 min', value: 25 * 60 },
  { id: 2, label: '50 min', value: 50 * 60 },
  { id: 3, label: 'Custom', value: 'custom' },
];

const soundOptions = [
  { id: 1, label: 'Nature', source: null },
  { id: 2, label: 'White Noise', source: null },
  { id: 3, label: 'None', source: null },
];

export default function FocusScreen() {
  const { theme } = useTheme();
  const { addCompletedSession } = useAppContext();
  const isDark = theme === 'dark';
  
  const [selectedSessionOption, setSelectedSessionOption] = useState(sessionOptions[0]);
  const [selectedSoundOption, setSelectedSoundOption] = useState(soundOptions[2]);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [timeRemaining, setTimeRemaining] = useState(selectedSessionOption.value);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    if (selectedSessionOption.value !== 'custom') {
      setTimeRemaining(selectedSessionOption.value);
    } else {
      setTimeRemaining(customMinutes * 60);
    }
  }, [selectedSessionOption, customMinutes]);
  
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);
      setIsComplete(true);
      addCompletedSession();
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining]);
  
  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      translateY.value = withTiming(-100, { duration: 500 });
      opacity.value = withTiming(0, { duration: 300 });
    } else if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };
  
  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    if (selectedSessionOption.value !== 'custom') {
      setTimeRemaining(selectedSessionOption.value);
    } else {
      setTimeRemaining(customMinutes * 60);
    }
    translateY.value = withTiming(0, { duration: 500 });
    opacity.value = withTiming(1, { duration: 300 });
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });
  
  if (isComplete) {
    return (
      <SessionComplete 
        onComplete={() => {
          setIsComplete(false);
          handleReset();
        }}
      />
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <View style={styles.timerContainer}>
        <TimerCircle 
          progress={isActive ? 1 - (timeRemaining / (selectedSessionOption.value === 'custom' ? customMinutes * 60 : selectedSessionOption.value)) : 0}
          isPaused={isPaused}
        >
          <Text style={[styles.timerText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {formatTime(timeRemaining)}
          </Text>
          {isActive && (
            <Text style={[styles.statusText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {isPaused ? 'Paused' : 'Focusing'}
            </Text>
          )}
        </TimerCircle>
        
        <View style={styles.controls}>
          {isActive && (
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#EF4444' }]} 
              onPress={handleReset}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              { backgroundColor: isActive && !isPaused ? '#F59E0B' : '#10B981' }
            ]} 
            onPress={handleStart}
          >
            {isActive && !isPaused ? (
              <Pause size={24} color="#FFFFFF" />
            ) : (
              <Play size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          
          {isActive && (
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} 
              onPress={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 size={24} color={isDark ? '#FFFFFF' : '#0F172A'} />
              ) : (
                <Volume size={24} color={isDark ? '#FFFFFF' : '#0F172A'} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Animated.View style={[styles.settingsContainer, animatedStyle]}>
        <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          Session Length
        </Text>
        <View style={styles.optionsContainer}>
          {sessionOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: selectedSessionOption.id === option.id 
                    ? '#10B981' 
                    : isDark ? '#334155' : '#E2E8F0'
                }
              ]}
              onPress={() => setSelectedSessionOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: selectedSessionOption.id === option.id
                      ? '#FFFFFF'
                      : isDark ? '#FFFFFF' : '#0F172A'
                  }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {selectedSessionOption.value === 'custom' && (
          <View style={styles.customTimeContainer}>
            <TouchableOpacity
              style={[styles.customTimeButton, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
              onPress={() => setCustomMinutes(Math.max(5, customMinutes - 5))}
            >
              <Minus size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
            </TouchableOpacity>
            
            <Text style={[styles.customTimeText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {customMinutes} min
            </Text>
            
            <TouchableOpacity
              style={[styles.customTimeButton, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
              onPress={() => setCustomMinutes(Math.min(120, customMinutes + 5))}
            >
              <Plus size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#0F172A', marginTop: 24 }]}>
          Background Sound
        </Text>
        <View style={styles.optionsContainer}>
          {soundOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: selectedSoundOption.id === option.id 
                    ? '#10B981' 
                    : isDark ? '#334155' : '#E2E8F0'
                }
              ]}
              onPress={() => setSelectedSoundOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: selectedSoundOption.id === option.id
                      ? '#FFFFFF'
                      : isDark ? '#FFFFFF' : '#0F172A'
                  }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'center',
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsContainer: {
    paddingTop: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  customTimeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTimeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginHorizontal: 16,
  },
});