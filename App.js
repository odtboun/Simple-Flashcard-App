import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import AddScreen from './src/screens/AddScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import CardsScreen from './src/screens/CardsScreen';
import EditCardScreen from './src/screens/EditCardScreen';
import { theme } from './src/utils/theme';

// Ensure we're using the correct navigator for web
const Stack = createNativeStackNavigator();

function ErrorFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.dark }}>
      <Text style={{ color: theme.text }}>Something went wrong!</Text>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.dark }}>
        <SafeAreaProvider>
          <NavigationContainer
            fallback={<Text style={{ color: theme.text }}>Loading...</Text>}
            onStateChange={(state) => {
              console.log('New navigation state:', state);
            }}
          >
            <StatusBar barStyle="light-content" />
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.dark,
                },
                headerTintColor: theme.text,
                contentStyle: {
                  backgroundColor: theme.dark,
                },
                animation: 'slide_from_right', // Add smooth transitions
              }}
            >
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                  title: 'Flashcards'
                }}
              />
              <Stack.Screen 
                name="Add" 
                component={AddScreen}
                options={{
                  title: 'Add New Card'
                }}
              />
              <Stack.Screen 
                name="Review" 
                component={ReviewScreen}
                options={{
                  title: 'Review Cards'
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
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </View>
    </GestureHandlerRootView>
  );
}

export default App; 