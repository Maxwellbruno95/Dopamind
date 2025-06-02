import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Check } from 'lucide-react-native';
import { SUBSCRIPTION_PRICES } from '@/types/subscription';

type UpgradeModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function UpgradeModal({ visible, onClose }: UpgradeModalProps) {
  const { theme } = useTheme();
  const { tier, upgradeSubscription } = useSubscription();
  const isDark = theme === 'dark';

  const handleUpgrade = async (newTier: 'pro' | 'elite') => {
    try {
      await upgradeSubscription(newTier);
      onClose();
    } catch (error) {
      console.error('Failed to upgrade:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.content, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            Upgrade Your Experience
          </Text>
          
          <ScrollView style={styles.plansContainer}>
            {/* Pro Plan */}
            <View style={[styles.plan, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
              <Text style={[styles.planTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Pro
              </Text>
              <Text style={[styles.price, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                ${SUBSCRIPTION_PRICES.pro.monthly}/month
              </Text>
              <Text style={[styles.yearlyPrice, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                or ${SUBSCRIPTION_PRICES.pro.yearly}/year (save 33%)
              </Text>
              
              <View style={styles.features}>
                {[
                  'Unlimited focus sessions',
                  'Custom session durations',
                  'Premium soundscapes',
                  'Advanced mood analytics',
                  '365-day history',
                  'Dark mode themes',
                  'Offline mode',
                ].map((feature, index) => (
                  <View key={index} style={styles.feature}>
                    <Check size={16} color="#10B981" />
                    <Text style={[styles.featureText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#10B981' }]}
                onPress={() => handleUpgrade('pro')}
              >
                <Text style={styles.buttonText}>Upgrade to Pro</Text>
              </TouchableOpacity>
            </View>
            
            {/* Elite Plan */}
            <View style={[styles.plan, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
              <Text style={[styles.planTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Elite
              </Text>
              <Text style={[styles.price, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                ${SUBSCRIPTION_PRICES.elite.monthly}/month
              </Text>
              <Text style={[styles.yearlyPrice, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                or ${SUBSCRIPTION_PRICES.elite.yearly}/year (save 25%)
              </Text>
              
              <View style={styles.features}>
                {[
                  'Everything in Pro, plus:',
                  '1-on-1 coaching sessions',
                  'Custom program creation',
                  'Family sharing (up to 6)',
                  'Priority support',
                  'Early access to features',
                  'Unlimited history',
                ].map((feature, index) => (
                  <View key={index} style={styles.feature}>
                    <Check size={16} color="#10B981" />
                    <Text style={[styles.featureText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#8B5CF6' }]}
                onPress={() => handleUpgrade('elite')}
              >
                <Text style={styles.buttonText}>Upgrade to Elite</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  plansContainer: {
    flex: 1,
  },
  plan: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  yearlyPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  features: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});