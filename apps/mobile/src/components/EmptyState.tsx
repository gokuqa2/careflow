import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  message?: string;
}

export default function EmptyState({ message = 'No tasks found.' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📋</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  icon: { fontSize: 36, marginBottom: 12 },
  message: { fontSize: 15, color: '#94A3B8', textAlign: 'center' },
});
