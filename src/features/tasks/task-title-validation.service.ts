import { TaskTitleValidationResult } from './task-title-validation';

export const validateTaskTitleWithServer = async (
  title: string,
): Promise<TaskTitleValidationResult> => {
  try {
    const response = await fetch('/api/tasks/validate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    const data = (await response.json()) as {
      ok?: boolean;
      error?: string;
    };

    if (!response.ok || !data.ok) {
      return {
        ok: false,
        error:
          data.error ||
          'No se pudo validar el nombre de la tarea en backend.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'No se pudo validar el nombre de la tarea en backend.',
    };
  }
};
