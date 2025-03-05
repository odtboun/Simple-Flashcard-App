import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { theme } from '../utils/theme';
import { createCard } from '../services/cardService';

export default function ImportScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
      });

      if (result.canceled) {
        return;
      }

      setLoading(true);
      let fileContent;

      if (Platform.OS === 'web') {
        // For web, we can read the file directly
        const response = await fetch(result.assets[0].uri);
        fileContent = await response.text();
      } else {
        // For mobile, we need to read the file using fetch
        const response = await fetch(result.assets[0].uri);
        fileContent = await response.text();
      }

      // Parse CSV
      Papa.parse(fileContent, {
        complete: (results) => {
          // Validate CSV format
          const validCards = results.data
            .filter(row => row.length === 2 && row[0] && row[1]) // Only accept rows with exactly 2 non-empty values
            .map(([front, back]) => ({
              front: front.trim(),
              back: back.trim(),
            }));

          if (validCards.length === 0) {
            Alert.alert(
              'Invalid Format',
              'The CSV file must contain exactly 2 columns (front and back text) per row.'
            );
            setLoading(false);
            return;
          }

          setCards(validCards);
          setLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          Alert.alert('Error', 'Failed to parse CSV file');
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to read file');
      setLoading(false);
    }
  };

  const importCards = async () => {
    try {
      setImporting(true);
      let imported = 0;

      // Import cards one by one to show progress
      for (const card of cards) {
        await createCard(card);
        imported++;
        setProgress((imported / cards.length) * 100);
      }

      Alert.alert(
        'Success',
        `Imported ${imported} cards successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error importing cards:', error);
      Alert.alert('Error', 'Failed to import cards');
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      {!cards.length ? (
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickCSV}
            disabled={loading}
          >
            <Text style={styles.uploadButtonText}>
              {loading ? 'Reading file...' : 'Select CSV File'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            CSV file should have 2 columns:{'\n'}
            First column: Front text{'\n'}
            Second column: Back text
          </Text>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>
            Preview ({cards.length} cards)
          </Text>
          <ScrollView style={styles.cardList}>
            {cards.map((card, index) => (
              <View key={index} style={styles.cardPreview}>
                <TextInput
                  style={[styles.cardText, styles.selectableText]}
                  value={`Front: ${card.front}`}
                  multiline
                  editable={false}
                  selectTextOnFocus={true}
                  contextMenuHidden={false}
                  selectionColor={theme.primary}
                />
                <TextInput
                  style={[styles.cardText, styles.selectableText]}
                  value={`Back: ${card.back}`}
                  multiline
                  editable={false}
                  selectTextOnFocus={true}
                  contextMenuHidden={false}
                  selectionColor={theme.primary}
                />
              </View>
            ))}
          </ScrollView>
          {importing ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator color={theme.primary} />
              <Text style={styles.progressText}>
                Importing... {Math.round(progress)}%
              </Text>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setCards([])}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.importButton]}
                onPress={importCards}
              >
                <Text style={styles.buttonText}>Import Cards</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
    padding: 20,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: theme.primary,
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: theme.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpText: {
    color: theme.text,
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  previewContainer: {
    flex: 1,
  },
  previewTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cardList: {
    flex: 1,
  },
  cardPreview: {
    backgroundColor: theme.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardText: {
    color: theme.text,
    fontSize: 16,
    marginBottom: 5,
    padding: 8,
    textAlignVertical: 'top',
  },
  selectableText: {
    backgroundColor: theme.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  progressText: {
    color: theme.text,
    fontSize: 16,
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: theme.error,
  },
  importButton: {
    backgroundColor: theme.primary,
  },
  buttonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 