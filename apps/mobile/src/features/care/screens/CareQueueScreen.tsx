import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { fetchCareData } from '../careSlice';
import {
  selectTasks, selectCareStatus, selectCareError,
  selectHighPriorityTasks, selectPendingTasks,
} from '../careSelectors';
import type { CareTask, RootStackParamList } from '../types';
import TaskCard from '../components/TaskCard';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CareQueue'>;

type Filter = 'all' | 'high' | 'pending' | 'completed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High Priority' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

export default function CareQueueScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const status = useAppSelector(selectCareStatus);
  const error = useAppSelector(selectCareError);
  const allTasks = useAppSelector(selectTasks);
  const highTasks = useAppSelector(selectHighPriorityTasks);
  const pendingTasks = useAppSelector(selectPendingTasks);

  const filteredTasks: CareTask[] = (() => {
    switch (activeFilter) {
      case 'high': return highTasks;
      case 'pending': return pendingTasks;
      case 'completed': return allTasks.filter(t => t.status === 'completed');
      default: return allTasks;
    }
  })();

  // Stable reference across renders so React.memo on TaskCard can actually skip re-renders.
  const handleTaskPress = useCallback((patientId: string) => {
    navigation.navigate('PatientDetail', { patientId });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: CareTask }) => <TaskCard task={item} onPress={handleTaskPress} />,
    [handleTaskPress]
  );

  const listContentStyle = useMemo(
    () => [styles.list, { paddingBottom: insets.bottom + 12 }, filteredTasks.length === 0 && styles.listEmpty],
    [insets.bottom, filteredTasks.length]
  );

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F4C81" />
        <Text style={styles.loadingText}>Loading care queue...</Text>
      </View>
    );
  }

  if (status === 'failed' && error) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchCareData())} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === f.key }}
          >
            <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={listContentStyle}
        ListEmptyComponent={<EmptyState message="No tasks found." />}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 15 },
  filterBar: {
    flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 8,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: '#0F4C81', borderColor: '#0F4C81' },
  filterLabel: { fontSize: 13, color: '#475569', fontWeight: '500' },
  filterLabelActive: { color: '#FFFFFF', fontWeight: '600' },
  list: { padding: 12 },
  listEmpty: { flex: 1 },
});
