import { NextRequest, NextResponse } from 'next/server';
import { validateTaskTitleOnServer } from '@/features/tasks/task-title-validation';

type ValidateTitleBody = {
  title?: string;
};

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateTitleBody;
    const { title } = body;

    if (typeof title !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'title es requerido.' },
        { status: 400 },
      );
    }

    const validation = validateTaskTitleOnServer(title);

    if (!validation.ok) {
      return NextResponse.json(validation, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No se pudo validar el nombre de la tarea.' },
      { status: 500 },
    );
  }
}
