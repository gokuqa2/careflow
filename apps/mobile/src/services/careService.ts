import axios from 'axios';
import Constants from 'expo-constants';
import { CareTask, Patient, PatientDetail } from '../features/care/types';

const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

export const careService = {
  getPatients(): Promise<Patient[]> {
    return client.get<Patient[]>('/api/patients').then(r => r.data);
  },

  getPatient(id: string): Promise<PatientDetail> {
    return client.get<PatientDetail>(`/api/patients/${id}`).then(r => r.data);
  },

  getCareTasks(): Promise<CareTask[]> {
    return client.get<CareTask[]>('/api/care-tasks').then(r => r.data);
  },

  updateTask(id: string, update: { status: string }): Promise<CareTask> {
    return client.patch<CareTask>(`/api/care-tasks/${id}`, update).then(r => r.data);
  },
};
