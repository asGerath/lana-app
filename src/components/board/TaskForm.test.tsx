import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import TaskForm from './TaskForm';
import { theme } from '@/styles/theme';
import { createTask, setTasksError } from '@/store/slices/tasksSlice';

const mockDispatch = jest.fn();
const mockBuildTaskNode = jest.fn();
const mockTaskTitleExists = jest.fn();
const mockValidateTaskTitleWithServer = jest.fn();

const createBoardState = () => ({
  tasksById: {},
  columns: {
    pending: { id: 'pending', title: 'Pendiente', taskIds: [] },
    in_progress: { id: 'in_progress', title: 'En progreso', taskIds: [] },
    completed: { id: 'completed', title: 'Completado', taskIds: [] },
  },
  columnOrder: ['pending', 'in_progress', 'completed'],
});

let mockTasksState = {
  board: createBoardState(),
  error: null as string | null,
};

let mockAuthState = {
  user: { id: 'user-1' },
};

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    selector: (state: {
      tasks: typeof mockTasksState;
      auth: typeof mockAuthState;
    }) => unknown,
  ) => selector({ tasks: mockTasksState, auth: mockAuthState }),
}));

jest.mock('@/features/tasks/task-helpers', () => ({
  buildTaskNode: (...args: unknown[]) => mockBuildTaskNode(...args),
  taskTitleExists: (...args: unknown[]) => mockTaskTitleExists(...args),
}));

jest.mock('@/features/tasks/task-title-validation.service', () => ({
  validateTaskTitleWithServer: (...args: unknown[]) =>
    mockValidateTaskTitleWithServer(...args),
}));

const renderComponent = () =>
  render(
    <ThemeProvider theme={theme}>
      <TaskForm />
    </ThemeProvider>,
  );

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTasksState = {
      board: createBoardState(),
      error: null,
    };
    mockAuthState = {
      user: { id: 'user-1' },
    };

    mockTaskTitleExists.mockReturnValue(false);
    mockValidateTaskTitleWithServer.mockResolvedValue({ ok: true });
    mockBuildTaskNode.mockReturnValue({
      id: 'task-1',
      title: 'Nueva tarea #1',
      description: 'Descripcion',
      status: 'completed',
      favorite: false,
      createdBy: 'user-1',
      createdAt: 1,
      updatedAt: 1,
      version: 1,
    });
  });

  it('dispatches an error when there is no authenticated user', async () => {
    const user = userEvent.setup();
    mockAuthState = { user: null as never };

    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    expect(mockDispatch).toHaveBeenCalledWith(
      setTasksError('No hay un usuario autenticado.'),
    );
  });

  it('blocks duplicated titles before server validation', async () => {
    const user = userEvent.setup();
    mockTaskTitleExists.mockReturnValue(true);

    renderComponent();

    await user.type(screen.getByLabelText('Nombre'), 'Duplicada #1');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    expect(mockDispatch).toHaveBeenCalledWith(
      setTasksError('Ya existe una tarea con ese nombre.'),
    );
    expect(mockValidateTaskTitleWithServer).not.toHaveBeenCalled();
  });

  it('dispatches the backend validation error when the title is invalid', async () => {
    const user = userEvent.setup();
    mockValidateTaskTitleWithServer.mockResolvedValue({
      ok: false,
      error: 'El titulo debe incluir un caracter especial.',
    });

    renderComponent();

    await user.type(screen.getByLabelText('Nombre'), 'Titulo invalido');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        setTasksError('El titulo debe incluir un caracter especial.'),
      );
    });
  });

  it('creates a task and resets the form when validation succeeds', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.type(screen.getByLabelText('Nombre'), 'Nueva tarea #1');
    await user.type(screen.getByLabelText('Descripción'), 'Descripcion');
    await user.selectOptions(screen.getByLabelText('Estado inicial'), 'completed');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    await waitFor(() => {
      expect(mockValidateTaskTitleWithServer).toHaveBeenCalledWith('Nueva tarea #1');
    });

    expect(mockBuildTaskNode).toHaveBeenCalledWith({
      title: 'Nueva tarea #1',
      description: 'Descripcion',
      status: 'completed',
      createdBy: 'user-1',
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      createTask({
        task: mockBuildTaskNode.mock.results[0].value,
      }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(setTasksError(null));
    expect(screen.getByLabelText('Nombre')).toHaveValue('');
    expect(screen.getByLabelText('Descripción')).toHaveValue('');
    expect(screen.getByLabelText('Estado inicial')).toHaveValue('pending');
  });
});