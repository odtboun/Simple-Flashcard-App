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

export default function ReviewSessionScreen({ route, navigation }) {
  const { deckId } = route.params;
  const { user } = useUser();
  const [currentCard, setCurrentCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    loadNextCard();
  }, []);

  const loadNextCard = async () => {
    try {
      setIsLoading(true);
      const cards = await getDueCardsInDeck(deckId);

      if (cards && cards.length > 0) {
        setCurrentCard(cards[0]);
      } else {
        Alert.alert(
          'Review Complete',
          'No more cards due for review in this deck!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error loading next card:', error);
      Alert.alert('Error', 'Failed to load next card');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (rating) => {
    try {
      setIsLoading(true);
      
      // Prepare card data for FSRS
      const fsrsCard = {
        due: currentCard.due || new Date().toISOString(),
        stability: currentCard.stability || 0,
        difficulty: currentCard.difficulty || 0,
        elapsed_days: currentCard.elapsed_days || 0,
        scheduled_days: currentCard.scheduled_days || 0,
        reps: currentCard.reps || 0,
        lapses: currentCard.lapses || 0,
        state: currentCard.state || 'New',
      };
      
      // Get scheduling info from FSRS
      const schedulingInfo = scheduleCardWithRating(fsrsCard, rating);
      
      // Update card first
      await updateCardSchedule(currentCard.id, schedulingInfo);
      
      // Then create review log
      await createReviewLog(currentCard.id, rating, schedulingInfo);
      
      // Load next card
      setIsRevealed(false);
      await loadNextCard();
    } catch (error) {
      console.error('Error rating card:', error);
      if (error.code === 'PGRST116') {
        Alert.alert('Error', 'Could not find the card to update. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save review. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Return to Deck</Text>
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
        <View style={styles.ratingContainer}>
          <TouchableOpacity
            style={[styles.ratingButton, styles.againButton]}
            onPress={() => handleRate(FsrsRating.Again)}
          >
            <Text style={styles.ratingButtonText}>Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.ratingButton, styles.hardButton]}
            onPress={() => handleRate(FsrsRating.Hard)}
          >
            <Text style={styles.ratingButtonText}>Hard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.ratingButton, styles.goodButton]}
            onPress={() => handleRate(FsrsRating.Good)}
          >
            <Text style={styles.ratingButtonText}>Good</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.ratingButton, styles.easyButton]}
            onPress={() => handleRate(FsrsRating.Easy)}
          >
            <Text style={styles.ratingButtonText}>Easy</Text>
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
  ratingContainer: {
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
  ratingButtonText: {
    color: theme.dark,
    fontSize: 14,
    fontWeight: 'bold',
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
}); 