import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { updateCard } from '../services/cardService';
import { theme } from '../utils/theme';

export default function EditCardScreen({ route, navigation }) {
  const { card } = route.params;
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [loading, setLoading] = useState(false);

  const saveCard = async () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert('Error', 'Both front and back text are required');
      return;
    }

    try {
      setLoading(true);
      await updateCard(card.id, {
        front: front.trim(),
        back: back.trim(),
      });
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
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Front</Text>
        <TextInput
          style={styles.input}
          value={front}
          onChangeText={setFront}
          placeholder="Front text"
          placeholderTextColor={theme.textSecondary}
          multiline
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Back</Text>
        <TextInput
          style={styles.input}
          value={back}
          onChangeText={setBack}
          placeholder="Back text"
          placeholderTextColor={theme.textSecondary}
          multiline
          editable={!loading}
        />
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.buttonDisabled]} 
        onPress={saveCard}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Changes'}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: theme.text,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 12,
    color: theme.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 