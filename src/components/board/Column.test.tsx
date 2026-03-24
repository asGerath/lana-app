import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Column from './Column';
import { theme } from '@/styles/theme';

jest.mock('./TaskCard', () => ({
  __esModule: true,
  default: ({ task }: { task: { title: string } }) => <div>{task.title}</div>,
}));

describe('Column', () => {
  it('renders column title, badge and task cards', () => {
    render(
      <ThemeProvider theme={theme}>
        <Column
          column={{ id: 'pending', title: 'Por hacer', taskIds: ['task-1', 'task-2'] }}
          tasks={[
            {
              id: 'task-1',
              title: 'Primera tarea',
              description: 'Descripcion',
              status: 'pending',
              favorite: false,
              createdBy: 'user-1',
              createdAt: 1,
              updatedAt: 1,
              version: 1,
            },
            {
              id: 'task-2',
              title: 'Segunda tarea',
              description: 'Descripcion',
              status: 'pending',
              favorite: false,
              createdBy: 'user-1',
              createdAt: 1,
              updatedAt: 1,
              version: 1,
            },
          ]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('Por hacer')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Primera tarea')).toBeInTheDocument();
    expect(screen.getByText('Segunda tarea')).toBeInTheDocument();
  });
});
