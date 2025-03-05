import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getCards, getDueCards } from '../services/cardService';
import { theme } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const [dueCount, setDueCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCounts = async () => {
    console.log('Starting loadCounts...');
    try {
      setLoading(true);
      
      console.log('Fetching cards data...');
      const allCards = await getCards();
      console.log('All cards received:', allCards);
      
      console.log('Fetching due cards...');
      const dueCardsData = await getDueCards();
      console.log('Due cards received:', dueCardsData);
      
      console.log('Updating counts:', {
        total: allCards.length,
        due: dueCardsData.length
      });
      
      setTotalCount(allCards.length);
      setDueCount(dueCardsData.length);
      
      // Verify state updates
      console.log('State should be updated to:', {
        totalCount: allCards.length,
        dueCount: dueCardsData.length
      });
    } catch (error) {
      console.error('Error in loadCounts:', error);
    } finally {
      setLoading(false);
      console.log('LoadCounts completed');
    }
  };

  // Load counts on mount
  useEffect(() => {
    console.log('Mount effect triggered');
    loadCounts();
  }, []);

  // Load counts on focus
  useEffect(() => {
    console.log('Focus effect setup');
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen focused, reloading counts');
      loadCounts();
    });

    return unsubscribe;
  }, [navigation]);

  // Debug render
  console.log('Rendering HomeScreen with state:', { totalCount, dueCount, loading });

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{loading ? '-' : totalCount}</Text>
          <Text style={styles.statLabel}>Total Cards</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{loading ? '-' : dueCount}</Text>
          <Text style={styles.statLabel}>Due Today</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
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
  addButton: {
    backgroundColor: '#66BB6A',
  },
  cardsButton: {
    backgroundColor: '#29B6F6',
  },
}); 