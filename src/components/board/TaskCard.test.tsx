import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import TaskCard from './TaskCard';
import { theme } from '@/styles/theme';
import {
  deleteTask,
  moveTask,
  setTasksError,
  toggleFavorite,
  updateTask,
} from '@/store/slices/tasksSlice';

const mockDispatch = jest.fn();
const mockTaskTitleExists = jest.fn();
const mockValidateTaskTitleWithServer = jest.fn();

const createTask = (overrides: Partial<{ id: string; title: string; description: string; status: 'pending' | 'in_progress' | 'completed'; favorite: boolean; version: number; createdAt: number; }> = {}) => ({
  id: 'task-1',
  title: 'Tarea pendiente',
  description: 'Descripcion original',
  status: 'pending' as const,
  favorite: false,
  createdBy: 'user-1',
  createdAt: new Date('2026-03-10T12:00:00Z').getTime(),
  updatedAt: 1,
  version: 2,
  ...overrides,
});

const createBoardState = () => ({
  tasksById: {
    'task-1': createTask(),
    'task-2': createTask({
      id: 'task-2',
      title: 'Tarea completada',
      status: 'completed',
      description: 'Otra descripcion',
    }),
  },
  columns: {
    pending: { id: 'pending', title: 'Por hacer', taskIds: ['task-1'] },
    in_progress: { id: 'in_progress', title: 'En progreso', taskIds: [] },
    completed: { id: 'completed', title: 'Completado', taskIds: ['task-2'] },
  },
  columnOrder: ['pending', 'in_progress', 'completed'],
});

let mockTasksState = {
  board: createBoardState(),
};

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: { tasks: typeof mockTasksState }) => unknown) =>
    selector({ tasks: mockTasksState }),
}));

jest.mock('@/features/tasks/task-helpers', () => ({
  taskTitleExists: (...args: unknown[]) => mockTaskTitleExists(...args),
}));

jest.mock('@/features/tasks/task-title-validation.service', () => ({
  validateTaskTitleWithServer: (...args: unknown[]) =>
    mockValidateTaskTitleWithServer(...args),
}));

const renderComponent = (task = mockTasksState.board.tasksById['task-1']) =>
  render(
    <ThemeProvider theme={theme}>
      <TaskCard task={task} />
    </ThemeProvider>,
  );

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTasksState = {
      board: createBoardState(),
    };
    mockTaskTitleExists.mockReturnValue(false);
    mockValidateTaskTitleWithServer.mockResolvedValue({ ok: true });
    window.confirm = jest.fn(() => true);
  });

  it('renders task details, favorite badge and metadata', () => {
    renderComponent(createTask({ favorite: true }));

    expect(screen.getByText(/Tarea pendiente/)).toBeInTheDocument();
    expect(screen.getByText('Descripcion original')).toBeInTheDocument();
    expect(screen.getByText('Version: 2')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText(/Marzo/i)).toBeInTheDocument();
  });

  it('dispatches favorite toggle from the task menu', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Abrir acciones de la tarea' }));
    await user.click(screen.getByRole('menuitem', { name: 'Favorito' }));

    expect(mockDispatch).toHaveBeenCalledWith(toggleFavorite({ id: 'task-1' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('confirms before deleting and dispatches the delete action', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Abrir acciones de la tarea' }));
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }));

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Seguro que quieres eliminar la tarea "Tarea pendiente"?',
    );
    expect(mockDispatch).toHaveBeenCalledWith(deleteTask({ id: 'task-1' }));
  });

  it('moves the task to another column from the submenu', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Abrir acciones de la tarea' }));
    await user.click(screen.getByRole('menuitem', { name: /Mover a/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Completado' }));

    expect(mockDispatch).toHaveBeenCalledWith(
      moveTask({
        taskId: 'task-1',
        sourceColumnId: 'pending',
        destinationColumnId: 'completed',
        sourceIndex: 0,
        destinationIndex: 1,
      }),
    );
  });

  it('blocks duplicated titles while editing', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Abrir acciones de la tarea' }));
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }));

    const inputs = screen.getAllByRole('textbox');

    await user.clear(inputs[0]);
    await user.type(inputs[0], 'Tarea completada');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(mockDispatch).toHaveBeenCalledWith(
      setTasksError('Ya existe una tarea con ese nombre.'),
    );
    expect(mockValidateTaskTitleWithServer).not.toHaveBeenCalled();
  });

  it('updates the task when edit validation succeeds', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: 'Abrir acciones de la tarea' }));
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }));

    const inputs = screen.getAllByRole('textbox');

    await user.clear(inputs[0]);
    await user.type(inputs[0], 'Tarea editada #1');
    await user.clear(inputs[1]);
    await user.type(inputs[1], 'Descripcion nueva');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(mockValidateTaskTitleWithServer).toHaveBeenCalledWith('Tarea editada #1');
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      updateTask({
        id: 'task-1',
        expectedVersion: 2,
        changes: {
          title: 'Tarea editada #1',
          description: 'Descripcion nueva',
        },
      }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(setTasksError(null));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
    });
  });
});