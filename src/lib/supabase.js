import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig.extra.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a custom storage object that works for both web and mobile
const customStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } else {
        return AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item:', error);
    }
  },
  removeItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
}); 