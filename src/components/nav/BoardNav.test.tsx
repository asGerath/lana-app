import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import BoardNav from './BoardNav';
import { theme } from '@/styles/theme';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    <img {...props} alt={props.alt} />
  ),
}));

jest.mock('@/components/board/TaskFilters', () => ({
  __esModule: true,
  default: () => <div>Mocked Filters</div>,
}));

describe('BoardNav', () => {
  it('renders user name and toggles logout menu', async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();

    render(
      <ThemeProvider theme={theme}>
        <BoardNav userName="Ada Lovelace" onLogout={onLogout} />
      </ThemeProvider>,
    );

    expect(screen.getByText('Mocked Filters')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir menu de usuario' }));

    expect(screen.getByRole('menu', { name: 'Opciones de usuario' })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesion' }));

    expect(onLogout).toHaveBeenCalled();
  });

  it('closes the user menu on outside click', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider theme={theme}>
        <BoardNav userName="Ada Lovelace" onLogout={jest.fn()} />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Abrir menu de usuario' }));
    expect(screen.getByRole('menu', { name: 'Opciones de usuario' })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('menu', { name: 'Opciones de usuario' })).not.toBeInTheDocument();
  });
});
