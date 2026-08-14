import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Priority } from '../features/care/types';

const CONFIG: Record<Priority, { label: string; bg: string; text: string }> = {
  high: { label: 'High', bg: '#FEE2E2', text: '#B91C1C' },
  medium: { label: 'Medium', bg: '#FEF3C7', text: '#92400E' },
  low: { label: 'Low', bg: '#DCFCE7', text: '#166534' },
};

interface Props {
  priority: Priority;
}

export default function PriorityBadge({ priority }: Props) {
  const { label, bg, text } = CONFIG[priority];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 12, fontWeight: '600' },
});
