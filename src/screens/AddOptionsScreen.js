import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function AddOptionsScreen({ navigation }) {
  const handleOptionSelect = (screen) => {
    navigation.navigate('DeckSelection', {
      onDeckSelect: (deck) => {
        navigation.navigate(screen, { deckId: deck.id });
      }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionSelect('AddManual')}
      >
        <Ionicons name="create-outline" size={24} color={theme.text} />
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Add Manually</Text>
          <Text style={styles.optionDescription}>
            Create cards one by one
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionSelect('Import')}
      >
        <Ionicons name="document-outline" size={24} color={theme.text} />
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Import from CSV</Text>
          <Text style={styles.optionDescription}>
            Import multiple cards from a CSV file
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.textSecondary,
  },
}); 