import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialAuthState } from '@/features/auth/initialState';
import { SessionData, User } from '@/features/auth/types';

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        session: SessionData;
      }>,
    ) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    restoreSession: (
      state,
      action: PayloadAction<{
        user: User;
        session: SessionData;
      } | null>,
    ) => {
      if (!action.payload) {
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
        return;
      }

      state.user = action.payload.user;
      state.session = action.payload.session;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setAuthLoading,
  setAuthError,
  loginSuccess,
  logout,
  restoreSession,
} = authSlice.actions;

export const authReducer = authSlice.reducer;