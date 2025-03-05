import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const [dueCount, setDueCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCounts();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCounts = async () => {
    try {
      const storedCards = await AsyncStorage.getItem('flashcards');
      if (storedCards) {
        const cards = JSON.parse(storedCards);
        const today = new Date();
        const dueCards = cards.filter(card => new Date(card.nextReview) <= today);
        setDueCount(dueCards.length);
        setTotalCount(cards.length);
      } else {
        setDueCount(0);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total Cards</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{dueCount}</Text>
          <Text style={styles.statLabel}>Due Today</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.reviewButton]}
          onPress={() => navigation.navigate('Review')}
          disabled={dueCount === 0}
        >
          <Text style={styles.buttonText}>
            {dueCount === 0 ? 'No Cards Due' : `Review ${dueCount} Cards`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => navigation.navigate('Add')}
        >
          <Text style={styles.buttonText}>Add New Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cardsButton]}
          onPress={() => navigation.navigate('Cards')}
        >
          <Text style={styles.buttonText}>View All Cards</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.dark,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 10,
    minWidth: 140,
  },
  statNumber: {
    color: theme.primary,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    color: theme.text,
    fontSize: 16,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  button: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: theme.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: theme.primary,
  },
  addButton: {
    backgroundColor: '#66BB6A',
  },
  cardsButton: {
    backgroundColor: '#29B6F6',
  },
}); 