import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
          return;
        }
        
        console.log('Initial session:', data?.session ? 'Session exists' : 'No session');
        setUser(data?.session?.user ?? null);
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (signed in, signed out, etc.)
    try {
      console.log('Setting up auth state change listener...');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id ? 'User ID exists' : 'No user ID');
        setUser(session?.user ?? null);
      });

      return () => {
        console.log('Cleaning up auth state change listener...');
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
      setError(error.message);
      return () => {};
    }
  }, []);

  const value = {
    signUp: async (email, password) => {
      try {
        console.log('Attempting to sign up...');
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        console.log('Sign up successful');
        return data;
      } catch (error) {
        console.error('Error in signUp:', error);
        setError(error.message);
        throw error;
      }
    },
    signIn: async (email, password) => {
      try {
        console.log('Attempting to sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        console.log('Sign in successful');
        return data;
      } catch (error) {
        console.error('Error in signIn:', error);
        setError(error.message);
        throw error;
      }
    },
    signOut: async () => {
      try {
        console.log('Attempting to sign out...');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('Sign out successful');
      } catch (error) {
        console.error('Error in signOut:', error);
        setError(error.message);
        throw error;
      }
    },
    user,
    error,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 