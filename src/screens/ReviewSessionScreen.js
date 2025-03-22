import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, TextInput } from 'react-native';
import { getDueCards, updateCardReview } from '../services/cardService';
import { getDueCardsInDeck } from '../services/deckService';
import { calculateNextReview } from '../utils/spacedRepetition';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function ReviewScreen({ route, navigation }) {
  const deckId = route.params?.deckId;
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
      const dueCards = deckId 
        ? await getDueCardsInDeck(deckId)
        : await getDueCards();
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
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          Card {currentIndex + 1} of {cards.length}
        </Text>
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <TextInput
              style={[styles.cardText, styles.selectableText]}
              value={isFlipped ? cards[currentIndex].back : cards[currentIndex].front}
              multiline
              editable={false}
              selectTextOnFocus={true}
              contextMenuHidden={false}
              selectionColor={theme.primary}
            />
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
  },
  progress: {
    padding: 16,
    alignItems: 'center',
  },
  progressText: {
    color: theme.text,
    fontSize: 16,
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardContainer: {
    width: width - 32,
    aspectRatio: 3/2,
    backgroundColor: theme.surface,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  card: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  cardText: {
    color: theme.text,
    fontSize: 20,
    textAlign: 'center',
  },
  selectableText: {
    padding: 16,
  },
  controlsContainer: {
    padding: 16,
  },
  flipButton: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  flipButtonText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  responseButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  responseButtonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  againButton: {
    backgroundColor: theme.error,
  },
  hardButton: {
    backgroundColor: '#FFA726',
  },
  goodButton: {
    backgroundColor: theme.primary,
  },
  easyButton: {
    backgroundColor: '#66BB6A',
  },
  noCards: {
    color: theme.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
}); 