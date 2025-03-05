import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = 'https://yxpezkwoqevmyapknkjb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cGV6a3dvcWV2bXlhcGtua2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDAwMDMsImV4cCI6MjA1NjcxNjAwM30.Wys-UV9znkP3a_Z269bmr47mhhKbQEcGJw5db2aEsY0';

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