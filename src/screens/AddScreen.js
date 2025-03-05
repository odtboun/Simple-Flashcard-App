import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme';

export default function AddScreen({ navigation }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const saveCard = async () => {
    if (!front.trim() || !back.trim()) return;

    try {
      const existingCards = await AsyncStorage.getItem('flashcards');
      const cards = existingCards ? JSON.parse(existingCards) : [];
      
      const newCard = {
        id: Date.now().toString(),
        front,
        back,
        repetitions: 0,
        easiness: 2.5,
        interval: 1,
        nextReview: new Date().toISOString(),
      };

      cards.push(newCard);
      await AsyncStorage.setItem('flashcards', JSON.stringify(cards));
      
      setFront('');
      setBack('');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Front of card"
        placeholderTextColor={theme.textSecondary}
        value={front}
        onChangeText={setFront}
      />
      <TextInput
        style={styles.input}
        placeholder="Back of card"
        placeholderTextColor={theme.textSecondary}
        value={back}
        onChangeText={setBack}
      />
      <TouchableOpacity style={styles.button} onPress={saveCard}>
        <Text style={styles.buttonText}>Save Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.dark,
  },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 