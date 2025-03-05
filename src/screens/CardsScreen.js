import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { getCards, deleteCard } from '../services/cardService';
import { theme } from '../utils/theme';

export default function CardsScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      const fetchedCards = await getCards();
      setCards(fetchedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
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

  const getStatusText = (card) => {
    const nextReview = new Date(card.next_review);
    const today = new Date();
    
    if (nextReview <= today) {
      return "Due";
    }
    
    const daysUntilReview = Math.ceil((nextReview - today) / (1000 * 60 * 60 * 24));
    return `Due in ${daysUntilReview} days`;
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
          <Text style={styles.statusText}>{getStatusText(item)}</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cards.length === 0 ? (
        <Text style={styles.noCards}>No cards in the deck</Text>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  cardItem: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardTexts: {
    marginBottom: 12,
  },
  cardLabel: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardText: {
    color: theme.text,
    fontSize: 16,
    marginBottom: 12,
  },
  cardInfo: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  statusText: {
    color: theme.text,
    fontSize: 14,
    marginBottom: 4,
  },
  gradeText: {
    color: theme.text,
    fontSize: 14,
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
  noCards: {
    color: theme.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
}); 