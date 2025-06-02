import { Redirect } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  useFrameworkReady();
  const { user, loading } = useAuth();

  if (loading) return null;
  
  return <Redirect href={user ? '/(tabs)' : '/auth/login'} />;
}