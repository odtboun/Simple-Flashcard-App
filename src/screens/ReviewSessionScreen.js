import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { theme } from '../utils/theme';
import { 
  FsrsRating, 
  getCardForReview, 
  createReviewLog, 
  scheduleCardWithRating,
  updateCardSchedule 
} from '../services/fsrsService';
import { getDueCardsInDeck } from '../services/deckService';
import Flashcard from '../components/Flashcard';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ReviewSessionScreen({ route, navigation }) {
  const { deckId } = route.params;
  const { user } = useUser();
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [dueCards, setDueCards] = useState([]);

  useEffect(() => {
    loadInitialCards();
  }, []);

  const loadInitialCards = async () => {
    try {
      setIsLoading(true);
      const cards = await getDueCardsInDeck(deckId);

      if (cards && cards.length > 0) {
        setDueCards(cards.slice(1)); // Store all cards except the first one
        setCurrentCard(cards[0]); // Set first card as current
        if (cards.length > 1) {
          setNextCard(cards[1]); // Preload next card if available
        }
      } else {
        Alert.alert(
          'Review Complete',
          'No more cards due for review in this deck!',
          [{ text: 'OK', onPress: () => navigation.navigate('ReviewHome') }]
        );
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setIsLoading(false);
    }
  };

  const moveToNextCard = () => {
    if (dueCards.length === 0) {
      // No more cards
      Alert.alert(
        'Review Complete',
        'No more cards due for review in this deck!',
        [{ text: 'OK', onPress: () => navigation.navigate('ReviewHome') }]
      );
      return;
    }

    // Set the preloaded next card as current
    setCurrentCard(nextCard);
    // Reset reveal state for new card
    setIsRevealed(false);
    
    // Update the queue
    const remainingCards = dueCards.slice(1);
    setDueCards(remainingCards);
    
    // Preload the next card if available
    if (remainingCards.length > 0) {
      setNextCard(remainingCards[0]);
    } else {
      setNextCard(null);
    }
  };

  const handleRate = async (rating) => {
    const cardToUpdate = currentCard;
    
    // Immediately show next card
    moveToNextCard();

    // Handle the scheduling in the background
    try {
      // Prepare card data for FSRS
      const fsrsCard = {
        due: cardToUpdate.due || new Date().toISOString(),
        stability: cardToUpdate.stability || 0,
        difficulty: cardToUpdate.difficulty || 0,
        elapsed_days: cardToUpdate.elapsed_days || 0,
        scheduled_days: cardToUpdate.scheduled_days || 0,
        reps: cardToUpdate.reps || 0,
        lapses: cardToUpdate.lapses || 0,
        state: cardToUpdate.state || 'New',
      };
      
      // Get scheduling info from FSRS
      const schedulingInfo = scheduleCardWithRating(fsrsCard, rating);
      
      // Update card in the background
      await updateCardSchedule(cardToUpdate.id, schedulingInfo);
      await createReviewLog(cardToUpdate.id, rating, schedulingInfo);
    } catch (error) {
      console.error('Error updating card schedule:', error);
      // We don't show an alert here since we've already moved to the next card
      // Instead, we could implement a toast or snackbar to show non-blocking errors
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No cards due for review!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ReviewHome')}
        >
          <Text style={styles.buttonText}>Return to Review Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        isRevealed={isRevealed}
        onPress={() => setIsRevealed(!isRevealed)}
      />
      
      {isRevealed && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.ratingButton, styles.againButton]}
            onPress={() => handleRate(FsrsRating.Again)}
          >
            <Text style={styles.buttonText}>Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ratingButton, styles.hardButton]}
            onPress={() => handleRate(FsrsRating.Hard)}
          >
            <Text style={styles.buttonText}>Hard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ratingButton, styles.goodButton]}
            onPress={() => handleRate(FsrsRating.Good)}
          >
            <Text style={styles.buttonText}>Good</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ratingButton, styles.easyButton]}
            onPress={() => handleRate(FsrsRating.Easy)}
          >
            <Text style={styles.buttonText}>Easy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
    padding: 16,
    justifyContent: 'center',
  },
  message: {
    color: theme.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  ratingButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  againButton: {
    backgroundColor: '#FF4B4B',
  },
  hardButton: {
    backgroundColor: '#FF9F46',
  },
  goodButton: {
    backgroundColor: '#4CAF50',
  },
  easyButton: {
    backgroundColor: '#2196F3',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 