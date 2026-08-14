import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { CareTask } from '../types';
import PriorityBadge from '../../../components/PriorityBadge';

interface Props {
  task: CareTask;
  onPress: (patientId: string) => void;
}

function formatDueDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
  if (dateStr === today) return 'Due today';
  if (dateStr === tomorrow) return 'Due tomorrow';
  if (dateStr < today) return 'Overdue';
  return `Due ${dateStr}`;
}

// Memoized: keeps FlatList from re-rendering every card when only one task's status changes.
// Requires `onPress` to be a stable reference from the parent (useCallback) for the memo to pay off.
function TaskCard({ task, onPress }: Props) {
  const isCompleted = task.status === 'completed';
  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.completedCard]}
      onPress={() => onPress(task.patientId)}
      accessibilityRole="button"
      accessibilityLabel={`${task.title} for ${task.patientName}`}
    >
      <View style={styles.row}>
        <Text style={[styles.patientName, isCompleted && styles.completedText]}>
          {task.patientName}
        </Text>
        {isCompleted && <Text style={styles.completedBadge}>✓ Done</Text>}
      </View>
      <Text style={[styles.title, isCompleted && styles.completedText]}>{task.title}</Text>
      <View style={styles.footer}>
        <PriorityBadge priority={task.priority} />
        <Text style={styles.dueDate}>{formatDueDate(task.dueDate)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(TaskCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    // iOS reads shadow*; Android ignores it and reads elevation instead.
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  completedCard: { opacity: 0.65 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  title: { fontSize: 13, color: '#475569', marginTop: 4 },
  completedText: { textDecorationLine: 'line-through', color: '#94A3B8' },
  completedBadge: { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  dueDate: { fontSize: 12, color: '#94A3B8' },
});
