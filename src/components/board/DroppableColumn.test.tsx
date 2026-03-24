import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import DroppableColumn from './DroppableColumn';
import { theme } from '@/styles/theme';
import { createTask } from '@/store/slices/tasksSlice';

const mockDispatch = jest.fn();
const mockBuildTaskNode = jest.fn();
const mockTaskTitleExists = jest.fn();
const mockValidateTaskTitleWithServer = jest.fn();
const mockSetNodeRef = jest.fn();

const createBoardState = () => ({
  tasksById: {},
  columns: {
    pending: { id: 'pending', title: 'Por hacer', taskIds: ['task-1'] },
    in_progress: { id: 'in_progress', title: 'En progreso', taskIds: [] },
    completed: { id: 'completed', title: 'Completado', taskIds: [] },
  },
  columnOrder: ['pending', 'in_progress', 'completed'],
});

let mockTasksState = {
  board: createBoardState(),
};

let mockAuthState = {
  user: { id: 'user-1' },
};

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: mockSetNodeRef,
    isOver: false,
  }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: jest.fn(),
}));

jest.mock('./DraggableTaskCard', () => ({
  __esModule: true,
  default: ({ task }: { task: { title: string } }) => <div>{task.title}</div>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    selector: (state: { tasks: typeof mockTasksState; auth: typeof mockAuthState }) => unknown,
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

const column = { id: 'pending' as const, title: 'Por hacer', taskIds: ['task-1'] };
const tasks = [
  {
    id: 'task-1',
    title: 'Tarea visible',
    description: 'Descripcion',
    status: 'pending' as const,
    favorite: false,
    createdBy: 'user-1',
    createdAt: 1,
    updatedAt: 1,
    version: 1,
  },
];

const renderComponent = () =>
  render(
    <ThemeProvider theme={theme}>
      <DroppableColumn column={column} tasks={tasks} />
    </ThemeProvider>,
  );

describe('DroppableColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTasksState = {
      board: createBoardState(),
    };
    mockAuthState = {
      user: { id: 'user-1' },
    };
    mockTaskTitleExists.mockReturnValue(false);
    mockValidateTaskTitleWithServer.mockResolvedValue({ ok: true });
    mockBuildTaskNode.mockReturnValue({
      id: 'task-2',
      title: 'Nueva tarea #1',
      description: 'Detalle',
      status: 'pending',
      favorite: false,
      createdBy: 'user-1',
      createdAt: 1,
      updatedAt: 1,
      version: 1,
    });
  });

  it('renders the column header, count and draggable tasks', () => {
    renderComponent();

    expect(screen.getByText('Por hacer')).toBeInTheDocument();
    expect(screen.getByText('1 tarea')).toBeInTheDocument();
    expect(screen.getByText('Tarea visible')).toBeInTheDocument();
  });

  it('shows a validation error when there is no authenticated user', async () => {
    const user = userEvent.setup();
    mockAuthState = { user: null as never };

    renderComponent();

    await user.click(screen.getByRole('button', { name: '+ Nueva tarea' }));
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    expect(screen.getByText('No hay un usuario autenticado.')).toBeInTheDocument();
  });

  it('shows the duplicate-title error before calling backend validation', async () => {
    const user = userEvent.setup();
    mockTaskTitleExists.mockReturnValue(true);

    renderComponent();

    await user.click(screen.getByRole('button', { name: '+ Nueva tarea' }));
    await user.type(screen.getByLabelText('Nombre'), 'Duplicada #1');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    expect(screen.getByText('Ya existe una tarea con ese nombre.')).toBeInTheDocument();
    expect(mockValidateTaskTitleWithServer).not.toHaveBeenCalled();
  });

  it('renders the backend validation message when the title is invalid', async () => {
    const user = userEvent.setup();
    mockValidateTaskTitleWithServer.mockResolvedValue({
      ok: false,
      error: 'El titulo debe incluir un caracter especial.',
    });

    renderComponent();

    await user.click(screen.getByRole('button', { name: '+ Nueva tarea' }));
    await user.type(screen.getByLabelText('Nombre'), 'Titulo invalido');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    await waitFor(() => {
      expect(
        screen.getByText('El titulo debe incluir un caracter especial.'),
      ).toBeInTheDocument();
    });
  });

  it('creates a task and closes the modal when validation succeeds', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole('button', { name: '+ Nueva tarea' }));
    await user.type(screen.getByLabelText('Nombre'), 'Nueva tarea #1');
    await user.type(screen.getByLabelText('Descripcion'), 'Detalle');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));

    await waitFor(() => {
      expect(mockValidateTaskTitleWithServer).toHaveBeenCalledWith('Nueva tarea #1');
    });

    expect(mockBuildTaskNode).toHaveBeenCalledWith({
      title: 'Nueva tarea #1',
      description: 'Detalle',
      status: 'pending',
      createdBy: 'user-1',
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      createTask({ task: mockBuildTaskNode.mock.results[0].value }),
    );
    expect(screen.queryByText('Nueva tarea en Por hacer')).not.toBeInTheDocument();
  });
});