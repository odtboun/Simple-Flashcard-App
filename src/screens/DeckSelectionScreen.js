import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getDecks } from '../services/deckService';
import { theme } from '../utils/theme';

export default function DeckSelectionScreen({ route, navigation }) {
  const { mode } = route.params;
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      const fetchedDecks = await getDecks();
      setDecks(fetchedDecks);
    } catch (error) {
      console.error('Error loading decks:', error);
      if (initialLoad) {
        setDecks([]);
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleDeckSelect = (deck) => {
    if (mode === 'manual') {
      navigation.navigate('AddManual', { deckId: deck.id });
    } else if (mode === 'import') {
      navigation.navigate('Import', { deckId: deck.id });
    }
  };

  const renderDeck = ({ item }) => (
    <TouchableOpacity
      style={styles.deckItem}
      onPress={() => handleDeckSelect(item)}
    >
      <View style={styles.deckInfo}>
        <Text style={styles.deckName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.deckDescription}>{item.description}</Text>
        )}
      </View>
      <View style={styles.deckStats}>
        <Text style={styles.statsText}>
          {item.total_cards} cards • {item.due_cards} due
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && initialLoad) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (decks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No decks available</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateDeck')}
        >
          <Text style={styles.createButtonText}>Create a Deck</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Select a deck to {mode === 'manual' ? 'add cards to' : 'import cards into'}:
      </Text>
      <FlatList
        data={decks}
        renderItem={renderDeck}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    color: theme.text,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  deckItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deckInfo: {
    marginBottom: 8,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  deckDescription: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  deckStats: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 8,
    marginTop: 8,
  },
  statsText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 