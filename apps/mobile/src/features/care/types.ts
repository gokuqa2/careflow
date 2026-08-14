export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Patient {
  id: string;
  name: string;
  priority: Priority;
  assignedProvider: string;
}

export interface PatientDetail extends Patient {
  dateOfBirth: string;
  tasks: CareTask[];
}

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

export type RootStackParamList = {
  Dashboard: undefined;
  CareQueue: undefined;
  PatientDetail: { patientId: string };
};
