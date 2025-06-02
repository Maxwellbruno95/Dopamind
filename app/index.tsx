import { Redirect } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function Index() {
  useFrameworkReady();
  
  // Redirect to the main tabs without checking auth initially
  return <Redirect href="/(tabs)" />;
}