import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getDueCards } from '../services/cardService';
import { theme } from '../utils/theme';

export default function ReviewHomeScreen({ navigation }) {
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueCards();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDueCards();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDueCards = async () => {
    try {
      setLoading(true);
      const dueCards = await getDueCards();
      setDueCount(dueCards.length);
    } catch (error) {
      console.error('Error loading due cards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {dueCount === 0 ? (
          <Text style={styles.noCards}>No cards due for review!</Text>
        ) : (
          <>
            <Text style={styles.title}>Time to review!</Text>
            <Text style={styles.subtitle}>
              You have {dueCount} card{dueCount === 1 ? '' : 's'} due for review
            </Text>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => navigation.navigate('ReviewSession')}
            >
              <Text style={styles.reviewButtonText}>
                Review {dueCount} Card{dueCount === 1 ? '' : 's'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    color: theme.text,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  reviewButton: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  reviewButtonText: {
    color: theme.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  noCards: {
    fontSize: 18,
    color: theme.text,
    textAlign: 'center',
  },
}); 