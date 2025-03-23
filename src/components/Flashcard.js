import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function Flashcard({ front, back, isRevealed, onPress }) {
  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <TextInput
            style={[
              styles.cardText,
              styles.selectableText,
              isRevealed && styles.hidden
            ]}
            value={front}
            multiline
            editable={false}
            selectTextOnFocus={true}
            contextMenuHidden={false}
            selectionColor={theme.primary}
          />
          <TextInput
            style={[
              styles.cardText,
              styles.selectableText,
              !isRevealed && styles.hidden
            ]}
            value={back}
            multiline
            editable={false}
            selectTextOnFocus={true}
            contextMenuHidden={false}
            selectionColor={theme.primary}
          />
          <Text style={styles.tapHint}>
            {isRevealed ? 'Tap to show front' : 'Tap to show answer'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
  },
  cardText: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 16,
    bottom: 48,
    color: theme.text,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  selectableText: {
    padding: 16,
  },
  hidden: {
    display: 'none',
  },
  tapHint: {
    color: theme.textSecondary,
    fontSize: 14,
    position: 'absolute',
    bottom: 16,
  },
}); 