import { validateTaskTitleOnServer } from './task-title-validation';

describe('validateTaskTitleOnServer', () => {
  it('rejects empty titles', () => {
    expect(validateTaskTitleOnServer('   ')).toEqual({
      ok: false,
      error: 'El nombre de la tarea es obligatorio.',
    });
  });

  it('rejects titles without special characters', () => {
    expect(validateTaskTitleOnServer('Tarea importante')).toEqual({
      ok: false,
      error:
        'El nombre de la tarea debe incluir al menos un caracter especial (por ejemplo: !, @, #, $, %).',
    });
  });

  it('accepts titles with at least one special character', () => {
    expect(validateTaskTitleOnServer('Tarea urgente!')).toEqual({ ok: true });
    expect(validateTaskTitleOnServer('Deploy #1')).toEqual({ ok: true });
  });
});
