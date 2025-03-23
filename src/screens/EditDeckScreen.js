import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { updateDeck, deleteDeck } from '../services/deckService';
import { theme } from '../utils/theme';

export default function EditDeckScreen({ route, navigation }) {
  const { deck } = route.params;
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Deck name is required');
      return;
    }

    try {
      setLoading(true);
      await updateDeck(deck.id, {
        name: name.trim(),
        description: description.trim(),
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating deck:', error);
      Alert.alert('Error', 'Failed to update deck');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Deck",
      "Are you sure you want to delete this deck? All cards in this deck will be deleted.",
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
              setLoading(true);
              await deleteDeck(deck.id);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              console.error('Error deleting deck:', error);
              Alert.alert('Error', 'Failed to delete deck');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Deck Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter deck name"
          placeholderTextColor={theme.textSecondary}
          editable={!loading}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter deck description"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          editable={!loading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.dark} />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton, loading && styles.buttonDisabled]}
          onPress={handleDelete}
          disabled={loading}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete Deck</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
    padding: 16,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 12,
    color: theme.text,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: theme.primary,
  },
  deleteButton: {
    backgroundColor: theme.error,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: theme.text,
  },
}); 