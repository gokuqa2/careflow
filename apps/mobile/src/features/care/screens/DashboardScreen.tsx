import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { fetchCareData } from '../careSlice';
import {
  selectCareStatus, selectCareError,
  selectUrgentTaskCount, selectPendingTaskCount, selectTodaysPriorityTasks,
} from '../careSelectors';
import type { RootStackParamList } from '../types';
import ErrorState from '../../../components/ErrorState';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDueDate(d: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
  if (d === today) return 'today';
  if (d === tomorrow) return 'tomorrow';
  return d;
}

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const status = useAppSelector(selectCareStatus);
  const error = useAppSelector(selectCareError);
  const urgentCount = useAppSelector(selectUrgentTaskCount);
  const pendingCount = useAppSelector(selectPendingTaskCount);
  const todaysTasks = useAppSelector(selectTodaysPriorityTasks);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchCareData());
  }, [dispatch, status]);

  if (status === 'loading' && urgentCount === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F4C81" />
        <Text style={styles.loadingText}>Loading care data...</Text>
      </View>
    );
  }

  if (status === 'failed' && error && urgentCount === 0) {
    return (
      <ErrorState message={error} onRetry={() => dispatch(fetchCareData())} />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      refreshControl={
        <RefreshControl
          refreshing={status === 'loading'}
          onRefresh={() => dispatch(fetchCareData())}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.subtitle}>Care Overview</Text>
      </View>

      <View style={styles.countersRow}>
        <TouchableOpacity
          style={[styles.counter, styles.urgentCounter]}
          onPress={() => navigation.navigate('CareQueue')}
          accessibilityRole="button"
          accessibilityLabel={`${urgentCount} urgent tasks`}
        >
          <Text style={styles.counterNumber}>{urgentCount}</Text>
          <Text style={styles.counterLabel}>Urgent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.counter, styles.pendingCounter]}
          onPress={() => navigation.navigate('CareQueue')}
          accessibilityRole="button"
          accessibilityLabel={`${pendingCount} pending tasks`}
        >
          <Text style={styles.counterNumber}>{pendingCount}</Text>
          <Text style={styles.counterLabel}>Pending</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Priorities</Text>
        {todaysTasks.length === 0 ? (
          <Text style={styles.emptyText}>No high-priority tasks due today.</Text>
        ) : (
          todaysTasks.slice(0, 5).map(task => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskRow}
              onPress={() => navigation.navigate('PatientDetail', { patientId: task.patientId })}
              accessibilityRole="button"
            >
              <View style={styles.taskRowLeft}>
                <Text style={styles.taskPatient}>{task.patientName}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  {' · Due '}{formatDueDate(task.dueDate)}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.queueButton}
        onPress={() => navigation.navigate('CareQueue')}
        accessibilityRole="button"
      >
        <Text style={styles.queueButtonText}>View Full Care Queue →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 15 },
  header: { padding: 24, paddingTop: 32, backgroundColor: '#0F4C81' },
  greeting: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 13, color: '#93C5FD', marginTop: 4 },
  countersRow: { flexDirection: 'row', gap: 12, padding: 16 },
  counter: {
    flex: 1, borderRadius: 12, padding: 20, alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  urgentCounter: { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#DC2626' },
  pendingCounter: { backgroundColor: '#FFFBEB', borderLeftWidth: 4, borderLeftColor: '#D97706' },
  counterNumber: { fontSize: 36, fontWeight: '800', color: '#1E293B' },
  counterLabel: { fontSize: 13, color: '#64748B', marginTop: 4 },
  section: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
  taskRow: {
    backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  taskRowLeft: { flex: 1 },
  taskPatient: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  taskTitle: { fontSize: 13, color: '#475569', marginTop: 2 },
  taskMeta: { fontSize: 12, color: '#94A3B8', marginTop: 5 },
  chevron: { fontSize: 22, color: '#CBD5E1', marginLeft: 8 },
  queueButton: {
    margin: 16, marginTop: 8, padding: 16, backgroundColor: '#0F4C81',
    borderRadius: 10, alignItems: 'center',
  },
  queueButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});
