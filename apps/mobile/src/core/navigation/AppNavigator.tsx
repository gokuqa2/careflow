import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../features/care/types';
import DashboardScreen from '../../features/care/screens/DashboardScreen';
import CareQueueScreen from '../../features/care/screens/CareQueueScreen';
import PatientDetailScreen from '../../features/care/screens/PatientDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: { backgroundColor: '#0F4C81' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'CareFlow' }} />
        <Stack.Screen name="CareQueue" component={CareQueueScreen} options={{ title: 'Care Queue' }} />
        <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Patient' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
