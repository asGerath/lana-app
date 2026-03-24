import { TaskTree } from './types';

type PublishBoardUpdateParams = {
  userId: string;
  board: TaskTree;
  sourceClientId: string;
};

export const publishBoardUpdate = async ({
  userId,
  board,
  sourceClientId,
}: PublishBoardUpdateParams) => {
  try {
    await fetch('/api/tasks/realtime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        board,
        sourceClientId,
      }),
    });
  } catch {
    // No interrumpe UX local si falla el canal realtime.
  }
};
