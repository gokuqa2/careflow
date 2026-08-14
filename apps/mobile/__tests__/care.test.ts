import careReducer, { completeTask, fetchCareData } from '../src/features/care/careSlice';
import {
  selectUrgentTaskCount,
  selectPendingTaskCount,
  selectCompletedTaskCount,
  selectHighPriorityTasks,
  selectTodaysPriorityTasks,
} from '../src/features/care/careSelectors';
import type { CareTask, Patient } from '../src/features/care/types';
import type { RootState } from '../src/core/store';

const mockPatient: Patient = {
  id: 'p1',
  name: 'John Doe',
  priority: 'high',
  assignedProvider: 'Dr. Test',
};

const today = new Date().toISOString().split('T')[0];

const mockTasks: CareTask[] = [
  {
    id: 't1', patientId: 'p1', patientName: 'John Doe',
    title: 'Follow up', priority: 'high', status: 'pending', dueDate: today, notes: null,
  },
  {
    id: 't2', patientId: 'p1', patientName: 'John Doe',
    title: 'Lab review', priority: 'high', status: 'pending', dueDate: today, notes: null,
  },
  {
    id: 't3', patientId: 'p1', patientName: 'John Doe',
    title: 'Medication check', priority: 'medium', status: 'completed', dueDate: today, notes: null,
  },
  {
    id: 't4', patientId: 'p1', patientName: 'John Doe',
    title: 'Annual wellness', priority: 'low', status: 'pending', dueDate: today, notes: null,
  },
];

const stateWithData: RootState = {
  care: {
    patients: [mockPatient],
    tasks: mockTasks,
    status: 'succeeded',
    error: null,
  },
};

describe('careSlice reducer', () => {
  const initialState = {
    patients: [],
    tasks: [],
    status: 'idle' as const,
    error: null,
  };

  it('sets status to loading on fetchCareData.pending', () => {
    const action = { type: fetchCareData.pending.type };
    const state = careReducer(initialState, action);
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('populates patients and tasks on fetchCareData.fulfilled', () => {
    const action = {
      type: fetchCareData.fulfilled.type,
      payload: { patients: [mockPatient], tasks: mockTasks },
    };
    const state = careReducer(initialState, action);
    expect(state.status).toBe('succeeded');
    expect(state.patients).toHaveLength(1);
    expect(state.tasks).toHaveLength(4);
  });

  it('sets error on fetchCareData.rejected', () => {
    const action = { type: fetchCareData.rejected.type, payload: 'failed' };
    const state = careReducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Unable to load care data.');
  });

  it('updates task status on completeTask.fulfilled', () => {
    const stateWithTasks = { ...initialState, tasks: mockTasks };
    const completedTask = { ...mockTasks[0], status: 'completed' as const };
    const action = { type: completeTask.fulfilled.type, payload: completedTask };
    const state = careReducer(stateWithTasks, action);
    expect(state.tasks[0].status).toBe('completed');
    expect(state.tasks[1].status).toBe('pending'); // others unchanged
  });
});

describe('careSelectors', () => {
  it('selectUrgentTaskCount returns count of high+pending tasks', () => {
    expect(selectUrgentTaskCount(stateWithData)).toBe(2);
  });

  it('selectPendingTaskCount returns all pending tasks', () => {
    expect(selectPendingTaskCount(stateWithData)).toBe(3);
  });

  it('selectCompletedTaskCount returns completed tasks', () => {
    expect(selectCompletedTaskCount(stateWithData)).toBe(1);
  });

  it('selectHighPriorityTasks returns only high priority', () => {
    const result = selectHighPriorityTasks(stateWithData);
    expect(result.every(t => t.priority === 'high')).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('selectTodaysPriorityTasks excludes low-priority and completed', () => {
    const result = selectTodaysPriorityTasks(stateWithData);
    expect(result.every(t => t.priority !== 'low' && t.status === 'pending')).toBe(true);
  });
});
