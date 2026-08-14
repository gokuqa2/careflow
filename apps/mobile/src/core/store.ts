import { configureStore } from '@reduxjs/toolkit';
import careReducer from '../features/care/careSlice';

export const store = configureStore({
  reducer: {
    care: careReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
