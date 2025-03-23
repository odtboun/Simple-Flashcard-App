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
import { Ionicons } from '@expo/vector-icons';
import { getCards, getDueCards } from '../services/cardService';
import { getDecks } from '../services/deckService';
import { theme } from '../utils/theme';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ navigation }) {
  const { user } = useUser();
  const [dueCount, setDueCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Set up the header right button
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={showOptions}
          style={styles.headerButton}
        >
          <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }

      // Wait for user session to be ready
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, skipping data load');
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      console.log('Loading data for user:', user.id);

      const decksData = await getDecks();
      console.log('Loaded decks:', decksData);

      const allCards = await getCards();
      console.log('Loaded all cards:', allCards);

      const dueCardsData = await getDueCards();
      console.log('Loaded due cards:', dueCardsData);
      
      setTotalCount(allCards.length);
      setDueCount(dueCardsData.length);
      setDecks(decksData);
    } catch (error) {
      console.error('Error loading data:', error);
      if (initialLoad) {
        // Only clear data on initial load errors
        setTotalCount(0);
        setDueCount(0);
        setDecks([]);
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const showOptions = () => {
    Alert.alert(
      "Options",
      "Choose an action",
      [
        {
          text: "Create Deck",
          onPress: () => navigation.navigate('CreateDeck')
        },
        {
          text: "Add Cards Manually",
          onPress: () => navigation.navigate('DeckSelection', { mode: 'manual' })
        },
        {
          text: "Import Cards",
          onPress: () => navigation.navigate('DeckSelection', { mode: 'import' })
        },
        {
          text: "Cancel",
          style: "cancel"
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
        </View>
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

      <Text style={styles.sectionTitle}>My Decks</Text>
      
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginHorizontal: 20,
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
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    flex: 1,
  },
  deckDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  deckStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
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
}); 