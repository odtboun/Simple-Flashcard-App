import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UserProvider, useUser } from './src/contexts/UserContext';
import HomeScreen from './src/screens/HomeScreen';
import AddOptionsScreen from './src/screens/AddOptionsScreen';
import AddManualScreen from './src/screens/AddManualScreen';
import ImportScreen from './src/screens/ImportScreen';
import ReviewHomeScreen from './src/screens/ReviewHomeScreen';
import ReviewSessionScreen from './src/screens/ReviewSessionScreen';
import CardsScreen from './src/screens/CardsScreen';
import EditCardScreen from './src/screens/EditCardScreen';
import AccountScreen from './src/screens/AccountScreen';
import AuthScreen from './src/screens/AuthScreen';
import DeckDetailScreen from './src/screens/DeckDetailScreen';
import CreateDeckScreen from './src/screens/CreateDeckScreen';
import DeckSelectionScreen from './src/screens/DeckSelectionScreen';
import EditDeckScreen from './src/screens/EditDeckScreen';
import { theme } from './src/utils/theme';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.dark,
        },
        headerTintColor: theme.text,
        contentStyle: {
          backgroundColor: theme.dark,
        },
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{
          title: 'Flashcards'
        }}
      />
      <Stack.Screen 
        name="AddOptions" 
        component={AddOptionsScreen}
        options={{
          title: 'Add Cards'
        }}
      />
      <Stack.Screen 
        name="DeckSelection" 
        component={DeckSelectionScreen}
        options={{
          title: 'Select Deck'
        }}
      />
      <Stack.Screen 
        name="AddManual" 
        component={AddManualScreen}
        options={{
          title: 'Add New Card'
        }}
      />
      <Stack.Screen 
        name="Import" 
        component={ImportScreen}
        options={{
          title: 'Import Cards'
        }}
      />
      <Stack.Screen 
        name="Cards" 
        component={CardsScreen}
        options={{
          title: 'All Cards'
        }}
      />
      <Stack.Screen 
        name="EditCard" 
        component={EditCardScreen}
        options={{
          title: 'Edit Card'
        }}
      />
      <Stack.Screen 
        name="DeckDetail" 
        component={DeckDetailScreen}
        options={({ route }) => ({
          title: route.params?.deck?.name || 'Deck Details'
        })}
      />
      <Stack.Screen 
        name="CreateDeck" 
        component={CreateDeckScreen}
        options={{
          title: 'Create New Deck'
        }}
      />
      <Stack.Screen 
        name="EditDeck" 
        component={EditDeckScreen}
        options={{
          title: 'Edit Deck'
        }}
      />
    </Stack.Navigator>
  );
}

function ReviewStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.dark,
        },
        headerTintColor: theme.text,
        contentStyle: {
          backgroundColor: theme.dark,
        },
      }}
    >
      <Stack.Screen 
        name="ReviewHome" 
        component={ReviewHomeScreen}
        options={{
          title: 'Review',
          headerLeft: () => null
        }}
      />
      <Stack.Screen 
        name="ReviewSession" 
        component={ReviewSessionScreen}
        options={{
          title: 'Review Cards',
          headerLeft: undefined
        }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Review') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Review" 
        component={ReviewStack}
        options={{
          tabBarLabel: 'Review',
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          tabBarLabel: 'Account',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.dark,
          },
          headerTintColor: theme.text,
        }}
      />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { error: userError } = useUser();

  // Show loading state
  if (authLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show error state
  if (authError || userError) {
    const errorMessage = authError || userError;
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>An error occurred: {errorMessage}</Text>
        <Text style={styles.retryText}>Please try restarting the app.</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserProvider>
          <Navigation />
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});

export default App; 