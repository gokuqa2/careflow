import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../core/store';

const selectCare = (state: RootState) => state.care;

export const selectPatients = createSelector(selectCare, c => c.patients);
export const selectTasks = createSelector(selectCare, c => c.tasks);
export const selectCareStatus = createSelector(selectCare, c => c.status);
export const selectCareError = createSelector(selectCare, c => c.error);

export const selectUrgentTaskCount = createSelector(
  selectTasks,
  tasks => tasks.filter(t => t.priority === 'high' && t.status === 'pending').length
);

export const selectPendingTaskCount = createSelector(
  selectTasks,
  tasks => tasks.filter(t => t.status === 'pending').length
);

export const selectCompletedTaskCount = createSelector(
  selectTasks,
  tasks => tasks.filter(t => t.status === 'completed').length
);

export const selectHighPriorityTasks = createSelector(
  selectTasks,
  tasks => tasks.filter(t => t.priority === 'high')
);

export const selectPendingTasks = createSelector(
  selectTasks,
  tasks => tasks.filter(t => t.status === 'pending')
);

export const selectTodaysPriorityTasks = createSelector(selectTasks, tasks => {
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter(
    t => t.status === 'pending' && t.priority !== 'low' && t.dueDate <= today
  );
});

export const makeSelectTasksByPatient = (patientId: string) =>
  createSelector(selectTasks, tasks => tasks.filter(t => t.patientId === patientId));
