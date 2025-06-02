import { Platform } from 'react-native';
import { initStripe } from '@stripe/stripe-react-native';

const EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export async function initializeStripe() {
  if (Platform.OS === 'web') return;
  
  await initStripe({
    publishableKey: EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    merchantIdentifier: 'merchant.com.dopamind',
    urlScheme: 'dopamind',
  });
}

export const createSubscription = async (priceId: string) => {
  try {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};