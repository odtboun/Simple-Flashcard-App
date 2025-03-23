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
import { getCardsInDeck } from '../services/deckService';
import { deleteCard } from '../services/cardService';
import { theme } from '../utils/theme';

export default function DeckDetailScreen({ route, navigation }) {
  const { deck } = route.params;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Set up the header right button
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EditDeck', { deck })}
          style={styles.headerButton}
        >
          <Ionicons name="pencil" size={24} color={theme.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, deck]);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCards();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCards = async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      const fetchedCards = await getCardsInDeck(deck.id);
      setCards(fetchedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
      if (initialLoad) {
        setCards([]);
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    Alert.alert(
      "Delete Card",
      "Are you sure you want to delete this card?",
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
              await deleteCard(cardId);
              setCards(cards.filter(card => card.id !== cardId));
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', 'Failed to delete card');
            }
          }
        }
      ]
    );
  };

  const renderCard = ({ item }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardContent}>
        <View style={styles.cardTexts}>
          <Text style={styles.cardLabel}>Front:</Text>
          <Text style={styles.cardText}>{item.front}</Text>
          <Text style={styles.cardLabel}>Back:</Text>
          <Text style={styles.cardText}>{item.back}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.statusText}>
            Next review: {new Date(item.due).toLocaleDateString()}
          </Text>
          <Text style={styles.gradeText}>
            Grade: {Math.round(item.easiness * 10) / 10}
            {item.repetitions > 0 ? ` (${item.repetitions} reviews)` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditCard', { card: item })}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCard(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && initialLoad) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{cards.length}</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {cards.filter(card => new Date(card.due) <= new Date()).length}
            </Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </View>
        </View>
        {deck.description && (
          <Text style={styles.description}>{deck.description}</Text>
        )}
      </View>

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No cards in this deck yet</Text>
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.reviewButton,
            cards.length === 0 && styles.buttonDisabled
          ]}
          onPress={() => navigation.navigate('ReviewSession', { deckId: deck.id })}
          disabled={cards.length === 0}
        >
          <Text style={styles.buttonText}>Review Deck</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => navigation.navigate('AddManual', { deckId: deck.id })}
        >
          <Text style={styles.buttonText}>Add Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  header: {
    padding: 16,
    backgroundColor: theme.surface,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  statLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  description: {
    fontSize: 14,
    color: theme.text,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  cardItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardTexts: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 12,
  },
  cardInfo: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  statusText: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 14,
    color: theme.text,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: theme.primary,
  },
  deleteButton: {
    backgroundColor: theme.error,
  },
  actionButtonText: {
    color: theme.dark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.dark,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  reviewButton: {
    backgroundColor: theme.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  addButton: {
    backgroundColor: '#66BB6A',
  },
  buttonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
}); 