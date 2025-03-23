import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { theme } from '../utils/theme';
import { getDueCards } from '../services/fsrsService';

export default function ReviewHomeScreen({ navigation }) {
  const { user } = useUser();
  const [dueCards, setDueCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [stats, setStats] = useState({
    newCount: 0,
    learningCount: 0,
    reviewCount: 0,
    relearningCount: 0,
  });

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
      if (initialLoad) {
        setLoading(true);
      }
      
      const cards = await getDueCards();
      setDueCards(cards);

      // Calculate stats
      const newStats = {
        newCount: cards.filter(card => card.state === 'New').length,
        learningCount: cards.filter(card => card.state === 'Learning').length,
        reviewCount: cards.filter(card => card.state === 'Review').length,
        relearningCount: cards.filter(card => card.state === 'Relearning').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error loading due cards:', error);
      if (initialLoad) {
        setDueCards([]);
        setStats({
          newCount: 0,
          learningCount: 0,
          reviewCount: 0,
          relearningCount: 0,
        });
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const groupCardsByDeck = () => {
    const grouped = {};
    dueCards.forEach(card => {
      if (!card.deck) return; // Skip cards without a deck
      
      if (!grouped[card.deck.id]) {
        grouped[card.deck.id] = {
          id: card.deck.id,
          name: card.deck.name,
          cards: [],
          stats: {
            newCount: 0,
            learningCount: 0,
            reviewCount: 0,
            relearningCount: 0,
          },
        };
      }
      grouped[card.deck.id].cards.push(card);
      
      // Update deck stats
      switch (card.state) {
        case 'New':
          grouped[card.deck.id].stats.newCount++;
          break;
        case 'Learning':
          grouped[card.deck.id].stats.learningCount++;
          break;
        case 'Review':
          grouped[card.deck.id].stats.reviewCount++;
          break;
        case 'Relearning':
          grouped[card.deck.id].stats.relearningCount++;
          break;
      }
    });
    return Object.values(grouped);
  };

  const renderDeckItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deckItem}
      onPress={() => navigation.navigate('ReviewSession', { deckId: item.id })}
    >
      <Text style={styles.deckName}>{item.name}</Text>
      <View style={styles.statsContainer}>
        {item.stats.newCount > 0 && (
          <View style={[styles.statBadge, styles.newBadge]}>
            <Text style={styles.statText}>{item.stats.newCount} New</Text>
          </View>
        )}
        {item.stats.learningCount > 0 && (
          <View style={[styles.statBadge, styles.learningBadge]}>
            <Text style={styles.statText}>{item.stats.learningCount} Learning</Text>
          </View>
        )}
        {item.stats.reviewCount > 0 && (
          <View style={[styles.statBadge, styles.reviewBadge]}>
            <Text style={styles.statText}>{item.stats.reviewCount} Review</Text>
          </View>
        )}
        {item.stats.relearningCount > 0 && (
          <View style={[styles.statBadge, styles.relearningBadge]}>
            <Text style={styles.statText}>{item.stats.relearningCount} Relearning</Text>
          </View>
        )}
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

  const dueDecks = groupCardsByDeck();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Queue</Text>
        <View style={styles.totalStats}>
          {stats.newCount > 0 && (
            <View style={[styles.statBadge, styles.newBadge]}>
              <Text style={styles.statText}>{stats.newCount} New</Text>
            </View>
          )}
          {stats.learningCount > 0 && (
            <View style={[styles.statBadge, styles.learningBadge]}>
              <Text style={styles.statText}>{stats.learningCount} Learning</Text>
            </View>
          )}
          {stats.reviewCount > 0 && (
            <View style={[styles.statBadge, styles.reviewBadge]}>
              <Text style={styles.statText}>{stats.reviewCount} Review</Text>
            </View>
          )}
          {stats.relearningCount > 0 && (
            <View style={[styles.statBadge, styles.relearningBadge]}>
              <Text style={styles.statText}>{stats.relearningCount} Relearning</Text>
            </View>
          )}
        </View>
      </View>

      {dueDecks.length > 0 ? (
        <FlatList
          data={dueDecks}
          renderItem={renderDeckItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cards due for review!</Text>
          <Text style={styles.emptySubtext}>
            Great job! Take a break or add more cards to study.
          </Text>
        </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  totalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  list: {
    padding: 16,
  },
  deckItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    color: theme.dark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#2196F3',
  },
  learningBadge: {
    backgroundColor: '#FF9F46',
  },
  reviewBadge: {
    backgroundColor: '#4CAF50',
  },
  relearningBadge: {
    backgroundColor: '#FF4B4B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
}); 