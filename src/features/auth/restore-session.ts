import { getSessionFromStorage } from './auth-storage';
import { restoreSession } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store';

export const restoreUserSession = (dispatch: AppDispatch) => {
  const session = getSessionFromStorage();

  dispatch(restoreSession(session));
};