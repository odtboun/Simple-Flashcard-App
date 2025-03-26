import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile, deleteAccount } from '../services/userService';
import { theme } from '../utils/theme';

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('Current user ID:', user?.id);
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      const profile = await getUserProfile();
      setName(profile.name || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      if (initialLoad) {
        setName('');
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleUpdateName = async () => {
    try {
      setSaving(true);
      await updateUserProfile({ name: name.trim() });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAccount();
              signOut(); // Sign out after successful deletion
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading && initialLoad) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            editable={!saving}
          />
          <TouchableOpacity
            style={[styles.updateButton, saving && styles.buttonDisabled]}
            onPress={handleUpdateName}
            disabled={saving}
          >
            <Text style={styles.updateButtonText}>
              {saving ? 'Saving...' : 'Update Name'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
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
  form: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    color: theme.textSecondary,
    fontSize: 16,
    padding: 12,
    backgroundColor: theme.dark,
    borderRadius: 8,
  },
  input: {
    backgroundColor: theme.dark,
    borderRadius: 8,
    padding: 12,
    color: theme.text,
    fontSize: 16,
    marginBottom: 12,
  },
  updateButton: {
    backgroundColor: theme.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: theme.error,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteAccountButtonText: {
    color: theme.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 