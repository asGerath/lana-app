export const STORAGE_KEYS = {
  session: 'taskboard:session',
  token: 'taskboard:token',
  boardByUser: (userId: string) => `taskboard:user:${userId}:board`,
}; 