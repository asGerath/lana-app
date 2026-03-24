import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import TaskFilters from './TaskFilters';
import { theme } from '@/styles/theme';
import { setSearch, setSelectedStatus } from '@/store/slices/tasksSlice';

const mockDispatch = jest.fn();
let mockTasksState = {
  search: '',
  selectedStatus: 'all',
};

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    <img {...props} alt={props.alt} />
  ),
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: { tasks: typeof mockTasksState }) => unknown) =>
    selector({ tasks: mockTasksState }),
}));

describe('TaskFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTasksState = {
      search: '',
      selectedStatus: 'all',
    };
  });

  it('renders current search and selected status', () => {
    mockTasksState = {
      search: 'demo',
      selectedStatus: 'completed',
    };

    render(
      <ThemeProvider theme={theme}>
        <TaskFilters />
      </ThemeProvider>,
    );

    expect(screen.getByDisplayValue('demo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Completado')).toBeInTheDocument();
  });

  it('dispatches search and status changes', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={theme}>
        <TaskFilters />
      </ThemeProvider>,
    );

    await user.type(
      screen.getByPlaceholderText('Buscar por nombre o descripción'),
      'lana',
    );
    await user.selectOptions(screen.getByRole('combobox'), 'in_progress');

    expect(mockDispatch).toHaveBeenCalledWith(setSearch('l'));
    expect(mockDispatch).toHaveBeenLastCalledWith(
      setSelectedStatus('in_progress'),
    );
  });
});
