import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { tasksReducer } from './slices/tasksSlice';
import { appReducer } from './slices/appSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    tasks: tasksReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;