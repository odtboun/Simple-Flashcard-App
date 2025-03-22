import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDecks, deleteDeck } from '../services/deckService';
import { theme } from '../utils/theme';

export default function DeckListScreen({ navigation }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDecks();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const fetchedDecks = await getDecks();
      setDecks(fetchedDecks);
    } catch (error) {
      console.error('Error loading decks:', error);
      Alert.alert('Error', 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    Alert.alert(
      "Delete Deck",
      "Are you sure you want to delete this deck? All cards in this deck will be deleted.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDeck(deckId);
              setDecks(decks.filter(deck => deck.id !== deckId));
            } catch (error) {
              console.error('Error deleting deck:', error);
              Alert.alert('Error', 'Failed to delete deck');
            }
          }
        }
      ]
    );
  };

  const renderDeck = ({ item }) => (
    <TouchableOpacity
      style={styles.deckItem}
      onPress={() => navigation.navigate('DeckDetail', { deck: item })}
    >
      <View style={styles.deckContent}>
        <View style={styles.deckHeader}>
          <Text style={styles.deckName}>{item.name}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteDeck(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
        
        {item.description && (
          <Text style={styles.deckDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.deckStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.total_cards}</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.due_cards}</Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {item.last_reviewed_at
                ? new Date(item.last_reviewed_at).toLocaleDateString()
                : 'Never'}
            </Text>
            <Text style={styles.statLabel}>Last Review</Text>
          </View>
        </View>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={decks}
        renderItem={renderDeck}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No decks yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first deck to start learning!
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateDeck')}
      >
        <Ionicons name="add" size={24} color={theme.dark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  deckItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  deckContent: {
    padding: 16,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deckName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deckDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  deckStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 