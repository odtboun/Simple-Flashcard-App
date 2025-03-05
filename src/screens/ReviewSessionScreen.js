import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { getDueCards, updateCardReview } from '../services/cardService';
import { calculateNextReview } from '../utils/spacedRepetition';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function ReviewScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const dueCards = await getDueCards();
      setCards(dueCards);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = async (quality) => {
    if (cards.length === 0) return;

    const currentCard = cards[currentIndex];
    const { repetitions, easiness, interval } = calculateNextReview(
      quality,
      currentCard.repetitions,
      currentCard.easiness,
      currentCard.interval
    );

    try {
      await updateCardReview(currentCard.id, {
        easiness,
        interval,
        repetitions,
      });

      if (currentIndex < cards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(currentIndex + 1);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCards}>No cards due for review!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {isFlipped ? cards[currentIndex].back : cards[currentIndex].front}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
          <Text style={styles.flipButtonText}>Flip Card</Text>
        </TouchableOpacity>

        <View style={[styles.buttonContainer, { opacity: isFlipped ? 1 : 0 }]}>
          <TouchableOpacity
            style={[styles.responseButton, styles.againButton]}
            onPress={() => handleResponse(0)}
            disabled={!isFlipped}
          >
            <Text style={styles.responseButtonText}>Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.responseButton, styles.hardButton]}
            onPress={() => handleResponse(3)}
            disabled={!isFlipped}
          >
            <Text style={styles.responseButtonText}>Hard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.responseButton, styles.goodButton]}
            onPress={() => handleResponse(4)}
            disabled={!isFlipped}
          >
            <Text style={styles.responseButtonText}>Good</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.responseButton, styles.easyButton]}
            onPress={() => handleResponse(5)}
            disabled={!isFlipped}
          >
            <Text style={styles.responseButtonText}>Easy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: width - 40,
    height: 300,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.surface,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardText: {
    fontSize: 24,
    color: theme.text,
    textAlign: 'center',
  },
  controlsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  flipButton: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
    alignSelf: 'center',
    width: '60%',
  },
  flipButtonText: {
    color: theme.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  responseButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  responseButtonText: {
    color: theme.dark,
    fontWeight: 'bold',
    fontSize: 16,
  },
  againButton: {
    backgroundColor: theme.error,
  },
  hardButton: {
    backgroundColor: '#FFA726',
  },
  goodButton: {
    backgroundColor: '#66BB6A',
  },
  easyButton: {
    backgroundColor: '#29B6F6',
  },
  noCards: {
    color: theme.text,
    fontSize: 20,
    textAlign: 'center',
  },
}); 