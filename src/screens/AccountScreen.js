import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { userService } from '../services/userService';
import { theme } from '../utils/theme';

export default function AccountScreen({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const currentUser = await userService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await userService.signOut();
            // The AuthProvider will automatically handle the navigation
            // when it detects the user is null
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
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
                            await userService.deleteAccount();
                            // The AuthProvider will automatically handle the navigation
                            // when it detects the user is null
                        } catch (error) {
                            console.error('Error deleting account:', error);
                            Alert.alert('Error', 'Failed to delete account. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.section}>
                    <Text style={styles.email}>{user.email}</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.deleteButton]} 
                    onPress={handleDeleteAccount}
                >
                    <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.dark,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    section: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: theme.surface,
        borderRadius: 8,
    },
    email: {
        fontSize: 16,
        color: theme.text,
    },
    loadingText: {
        color: theme.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: theme.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: theme.dark,
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: theme.error,
        marginTop: 20,
    },
    deleteButtonText: {
        color: theme.dark,
    },
}); 