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
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, styles.manualOption]}
        onPress={() => navigation.navigate('AddManual')}
      >
        <Ionicons name="create" size={32} color={theme.dark} />
        <Text style={styles.optionTitle}>Add Cards Manually</Text>
        <Text style={styles.optionDescription}>
          Create cards one by one with custom content
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, styles.importOption]}
        onPress={() => navigation.navigate('Import')}
      >
        <Ionicons name="document" size={32} color={theme.dark} />
        <Text style={styles.optionTitle}>Import from CSV</Text>
        <Text style={styles.optionDescription}>
          Bulk import cards from a CSV file{'\n'}
          (2 columns: front text, back text)
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
    justifyContent: 'center',
  },
  option: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  manualOption: {
    backgroundColor: theme.primary,
  },
  importOption: {
    backgroundColor: '#66BB6A', // A nice green color
  },
  optionTitle: {
    color: theme.dark,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  optionDescription: {
    color: theme.dark,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 