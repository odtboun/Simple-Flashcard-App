import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createCard } from '../services/cardService';
import { theme } from '../utils/theme';

export default function AddScreen({ route, navigation }) {
  const { deckId } = route.params;
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [loading, setLoading] = useState(false);

  const saveCard = async () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert('Error', 'Both front and back text are required');
      return;
    }

    try {
      setLoading(true);
      await createCard({
        front: front.trim(),
        back: back.trim(),
        deck_id: deckId,
      });
      
      setFront('');
      setBack('');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving card:', error);
      Alert.alert('Error', 'Failed to save card');
    } finally {
      setLoading(false);
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
        multiline
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Back of card"
        placeholderTextColor={theme.textSecondary}
        value={back}
        onChangeText={setBack}
        multiline
        editable={!loading}
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={saveCard}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Save Card'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
    padding: 20,
  },
  input: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    color: theme.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 