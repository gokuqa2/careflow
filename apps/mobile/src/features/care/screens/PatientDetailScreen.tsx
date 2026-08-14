import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { completeTask } from '../careSlice';
import { makeSelectTasksByPatient, selectPatients, selectCareStatus } from '../careSelectors';
import type { RootStackParamList } from '../types';
import PriorityBadge from '../../../components/PriorityBadge';
import EmptyState from '../../../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'PatientDetail'>;

export default function PatientDetailScreen({ route, navigation }: Props) {
  const { patientId } = route.params;
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const patients = useAppSelector(selectPatients);
  const patient = patients.find(p => p.id === patientId);

  const selectTasks = makeSelectTasksByPatient(patientId);
  const tasks = useAppSelector(selectTasks);

  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    if (patient) navigation.setOptions({ title: patient.name });
  }, [navigation, patient]);

  const handleComplete = async (taskId: string, taskTitle: string) => {
    Alert.alert(
      'Complete Task',
      `Mark "${taskTitle}" as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setCompletingId(taskId);
            const result = await dispatch(completeTask(taskId));
            setCompletingId(null);
            if (completeTask.rejected.match(result)) {
              Alert.alert('Error', String(result.payload) || 'Failed to complete task.');
            }
          },
        },
      ]
    );
  };

  if (!patient) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0F4C81" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
      <View style={styles.patientCard}>
        <View style={styles.patientHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patient.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.provider}>{patient.assignedProvider}</Text>
          </View>
        </View>
        <View style={styles.priorityRow}>
          <Text style={styles.metaLabel}>Priority</Text>
          <PriorityBadge priority={patient.priority} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Care Tasks</Text>
        {tasks.length === 0 ? (
          <EmptyState message="No tasks assigned to this patient." />
        ) : (
          tasks.map(task => {
            const isPending = task.status === 'pending';
            const isCompleting = completingId === task.id;
            return (
              <View key={task.id} style={[styles.taskCard, !isPending && styles.taskCardDone]}>
                <View style={styles.taskHeader}>
                  <Text style={[styles.taskTitle, !isPending && styles.taskTitleDone]}>
                    {task.title}
                  </Text>
                  {!isPending && <Text style={styles.doneBadge}>✓ Completed</Text>}
                </View>

                <View style={styles.taskMeta}>
                  <PriorityBadge priority={task.priority} />
                  <Text style={styles.dueDate}>Due {task.dueDate}</Text>
                </View>

                {task.notes && (
                  <Text style={styles.notes}>{task.notes}</Text>
                )}

                {isPending && (
                  <TouchableOpacity
                    style={[styles.completeBtn, isCompleting && styles.completeBtnDisabled]}
                    onPress={() => handleComplete(task.id, task.title)}
                    disabled={isCompleting}
                    accessibilityRole="button"
                    accessibilityLabel={`Complete task: ${task.title}`}
                  >
                    {isCompleting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.completeBtnText}>Mark as Completed</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  patientCard: {
    backgroundColor: '#FFFFFF', margin: 16, borderRadius: 12, padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  patientHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#0F4C81',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 19, fontWeight: '700', color: '#1E293B' },
  provider: { fontSize: 13, color: '#64748B', marginTop: 2 },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaLabel: { fontSize: 13, color: '#64748B' },
  section: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  taskCard: {
    backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  taskCardDone: { opacity: 0.65 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B', flex: 1 },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  doneBadge: { fontSize: 12, color: '#16A34A', fontWeight: '600', marginLeft: 8 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  dueDate: { fontSize: 12, color: '#94A3B8' },
  notes: { fontSize: 13, color: '#64748B', marginTop: 10, lineHeight: 18 },
  completeBtn: {
    marginTop: 14, backgroundColor: '#16A34A', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  completeBtnDisabled: { backgroundColor: '#86EFAC' },
  completeBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});
