import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, CircleCheck as CheckCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to Dopamind',
    description: 'Your personal guide to digital wellbeing and mental balance.',
    image: 'https://images.pexels.com/photos/3820380/pexels-photo-3820380.jpeg',
  },
  {
    id: 2,
    title: 'Understanding Dopamine',
    description: 'Modern tech is designed to trigger constant dopamine hits, leading to addiction and reduced focus.',
    image: 'https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg',
  },
  {
    id: 3,
    title: 'Focus Sessions',
    description: 'Regular focus sessions help rebalance dopamine levels and improve your ability to concentrate.',
    image: 'https://images.pexels.com/photos/3758105/pexels-photo-3758105.jpeg',
  },
  {
    id: 4,
    title: 'Track Your Progress',
    description: 'Monitor your mood and build healthy streaks to see your improvement over time.',
    image: 'https://images.pexels.com/photos/5905710/pexels-photo-5905710.jpeg',
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState('');
  const scrollViewRef = useRef(null);
  const { width } = useWindowDimensions();
  
  const currentScreen = onboardingData[currentIndex];
  
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollViewRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true });
    } else {
      completeOnboarding();
    }
  };
  
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {onboardingData.map((screen, index) => (
          <View key={screen.id} style={[styles.screen, { width }]}>
            <Image
              source={{ uri: screen.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{screen.title}</Text>
              <Text style={styles.description}>{screen.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: index === currentIndex ? '#10B981' : '#475569' }
            ]}
          />
        ))}
      </View>
      
      <Animated.View 
        entering={FadeIn} 
        exiting={FadeOut}
        style={styles.buttonContainer}
      >
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          {currentIndex === onboardingData.length - 1 ? (
            <CheckCircle size={20} color="#FFFFFF" />
          ) : (
            <ChevronRight size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '50%',
  },
  contentContainer: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 36,
  },
  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginRight: 8,
  },
});