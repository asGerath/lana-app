import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Board from './Board';
import { theme } from '@/styles/theme';
import { moveTask } from '@/store/slices/tasksSlice';

const mockDispatch = jest.fn();
const mockSelectFilteredTasksByColumn = jest.fn();
const mockDndContext = jest.fn();

const mockState = {
  tasks: {
    board: {
      columns: {
        pending: { id: 'pending', title: 'Por hacer', taskIds: ['task-1'] },
        in_progress: { id: 'in_progress', title: 'En progreso', taskIds: [] },
        completed: { id: 'completed', title: 'Completado', taskIds: [] },
      },
      columnOrder: ['pending', 'in_progress', 'completed'],
    },
  },
};

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (event: unknown) => void }) => {
    mockDndContext(onDragEnd);
    return <div>{children}</div>;
  },
  PointerSensor: jest.fn(),
  closestCenter: jest.fn(),
  useSensor: jest.fn(() => 'sensor'),
  useSensors: jest.fn(() => ['sensor']),
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

jest.mock('@/features/tasks/task.selectors', () => ({
  selectFilteredTasksByColumn: (...args: unknown[]) => mockSelectFilteredTasksByColumn(...args),
}));

jest.mock('./DroppableColumn', () => ({
  __esModule: true,
  default: ({ column, tasks }: { column: { title: string }; tasks: { id: string }[] }) => (
    <div>{`${column.title}:${tasks.length}`}</div>
  ),
}));

describe('Board', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectFilteredTasksByColumn.mockImplementation((state, columnId) => {
      if (columnId === 'pending') return [{ id: 'task-1' }];
      return [];
    });
  });

  it('renders droppable columns using filtered selector results', () => {
    render(
      <ThemeProvider theme={theme}>
        <Board />
      </ThemeProvider>,
    );

    expect(screen.getByText('Por hacer:1')).toBeInTheDocument();
    expect(screen.getByText('En progreso:0')).toBeInTheDocument();
    expect(screen.getByText('Completado:0')).toBeInTheDocument();
    expect(mockSelectFilteredTasksByColumn).toHaveBeenCalledTimes(3);
  });

  it('dispatches moveTask when a valid drag finishes in another column', () => {
    render(
      <ThemeProvider theme={theme}>
        <Board />
      </ThemeProvider>,
    );

    const onDragEnd = mockDndContext.mock.calls[0][0];

    onDragEnd({
      active: {
        id: 'task-1',
        data: { current: { columnId: 'pending' } },
      },
      over: {
        id: 'column-in_progress',
      },
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      moveTask({
        taskId: 'task-1',
        sourceColumnId: 'pending',
        destinationColumnId: 'in_progress',
        sourceIndex: 0,
        destinationIndex: 0,
      }),
    );
  });

  it('does not dispatch when drag result is invalid or unchanged', () => {
    render(
      <ThemeProvider theme={theme}>
        <Board />
      </ThemeProvider>,
    );

    const onDragEnd = mockDndContext.mock.calls[0][0];

    onDragEnd({ active: { id: 'task-1', data: { current: { columnId: 'pending' } } }, over: null });
    onDragEnd({ active: { id: 'task-1', data: { current: { columnId: 'pending' } } }, over: { id: 'task-1' } });
    onDragEnd({ active: { id: 'task-1', data: { current: {} } }, over: { id: 'column-in_progress' } });
    onDragEnd({ active: { id: 'missing-task', data: { current: { columnId: 'pending' } } }, over: { id: 'column-in_progress' } });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
