import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Bell, Shield, CreditCard, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Volume2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          value: 'On',
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          value: isDark ? 'On' : 'Off',
        },
        {
          icon: Volume2,
          label: 'Sound Effects',
          value: 'On',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: Shield,
          label: 'Privacy',
          onPress: () => {},
        },
        {
          icon: CreditCard,
          label: 'Subscription',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & FAQ',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <ScrollView>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={[styles.groupTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {group.title}
            </Text>
            
            <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.item,
                      itemIndex < group.items.length - 1 && styles.itemBorder,
                      { borderBottomColor: isDark ? '#334155' : '#E2E8F0' }
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.itemContent}>
                      <View style={[
                        styles.iconContainer,
                        { backgroundColor: isDark ? '#334155' : '#F1F5F9' }
                      ]}>
                        <Icon size={20} color={isDark ? '#FFFFFF' : '#0F172A'} />
                      </View>
                      <Text style={[styles.itemLabel, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                        {item.label}
                      </Text>
                    </View>
                    
                    <View style={styles.itemRight}>
                      {item.value && (
                        <Text style={[styles.itemValue, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                          {item.value}
                        </Text>
                      )}
                      <ChevronRight size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});