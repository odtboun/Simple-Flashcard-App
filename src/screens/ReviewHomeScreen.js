import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { getDueDecks } from '../services/deckService';
import { getDueCards } from '../services/cardService';
import { theme } from '../utils/theme';

export default function ReviewHomeScreen({ navigation }) {
  const [dueDecks, setDueDecks] = useState([]);
  const [totalDueCards, setTotalDueCards] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDueData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDueData = async () => {
    try {
      setLoading(true);
      const [decks, cards] = await Promise.all([
        getDueDecks(),
        getDueCards(),
      ]);
      setDueDecks(decks);
      setTotalDueCards(cards.length);
    } catch (error) {
      console.error('Error loading due data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDeck = ({ item }) => (
    <TouchableOpacity
      style={styles.deckItem}
      onPress={() => navigation.navigate('ReviewSession', { deckId: item.id })}
    >
      <View style={styles.deckContent}>
        <Text style={styles.deckName}>{item.name}</Text>
        <Text style={styles.dueCount}>{item.due_cards} cards due</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (totalDueCards === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCards}>No cards due for review!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time to review!</Text>
        <Text style={styles.subtitle}>
          You have {totalDueCards} card{totalDueCards === 1 ? '' : 's'} due for review
        </Text>
      </View>

      <TouchableOpacity
        style={styles.reviewAllButton}
        onPress={() => navigation.navigate('ReviewSession')}
      >
        <Text style={styles.reviewAllButtonText}>
          Review All Due Cards ({totalDueCards})
        </Text>
      </TouchableOpacity>

      {dueDecks.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Review by Deck</Text>
          <FlatList
            data={dueDecks}
            renderItem={renderDeck}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  reviewAllButton: {
    backgroundColor: theme.primary,
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewAllButtonText: {
    color: theme.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  deckItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  deckContent: {
    padding: 16,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  dueCount: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  noCards: {
    color: theme.text,
    fontSize: 18,
    textAlign: 'center',
  },
}); 