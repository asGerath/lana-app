export type TaskTitleValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~¡¿]/;

export const validateTaskTitleOnServer = (
  rawTitle: string,
): TaskTitleValidationResult => {
  const title = rawTitle.trim();

  if (!title) {
    return { ok: false, error: 'El nombre de la tarea es obligatorio.' };
  }

  if (!SPECIAL_CHAR_REGEX.test(title)) {
    return {
      ok: false,
      error:
        'El nombre de la tarea debe incluir al menos un caracter especial (por ejemplo: !, @, #, $, %).',
    };
  }

  return { ok: true };
};
