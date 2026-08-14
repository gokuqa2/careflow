import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CareTask, Patient } from './types';
import { careService } from '../../services/careService';

const CACHE_KEY = '@careflow:tasks';

interface CareState {
  patients: Patient[];
  tasks: CareTask[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CareState = {
  patients: [],
  tasks: [],
  status: 'idle',
  error: null,
};

export const fetchCareData = createAsyncThunk(
  'care/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const [patients, tasks] = await Promise.all([
        careService.getPatients(),
        careService.getCareTasks(),
      ]);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
      return { patients, tasks };
    } catch {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        return rejectWithValue('offline');
      }
      return rejectWithValue('failed');
    }
  }
);

export const completeTask = createAsyncThunk(
  'care/completeTask',
  async (taskId: string, { getState, rejectWithValue }) => {
    try {
      const updated = await careService.updateTask(taskId, { status: 'completed' });
      const { care } = getState() as { care: CareState };
      const persisted = care.tasks.map(t => (t.id === taskId ? updated : t));
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(persisted));
      return updated;
    } catch {
      return rejectWithValue('Failed to complete task. Please try again.');
    }
  }
);

const careSlice = createSlice({
  name: 'care',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCareData.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCareData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.patients = action.payload.patients;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchCareData.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload === 'offline'
            ? 'Showing cached data. Check your connection.'
            : 'Unable to load care data.';
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      });
  },
});

export default careSlice.reducer;
