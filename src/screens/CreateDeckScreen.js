import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createDeck } from '../services/deckService';
import { theme } from '../utils/theme';

export default function CreateDeckScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Deck name is required');
      return;
    }

    try {
      setLoading(true);
      await createDeck({
        name: name.trim(),
        description: description.trim(),
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error creating deck:', error);
      Alert.alert('Error', 'Failed to create deck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Deck Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter deck name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={50}
            editable={!loading}
          />
          
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Enter deck description"
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Deck'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    color: theme.text,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 