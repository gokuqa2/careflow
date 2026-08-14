import axios from 'axios';

// Vite proxy forwards /api to localhost:5000 in dev;
// set VITE_API_URL for production builds
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface CareTask {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  notes: string | null;
}

export const careService = {
  getCareTasks(): Promise<CareTask[]> {
    return client.get<CareTask[]>('/api/care-tasks').then(r => r.data);
  },
  updateTask(id: string, update: { status: string }): Promise<CareTask> {
    return client.patch<CareTask>(`/api/care-tasks/${id}`, update).then(r => r.data);
  },
};
