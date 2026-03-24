import { render, screen } from '@testing-library/react';
import DraggableTaskCard from './DraggableTaskCard';

const mockUseSortable = jest.fn();

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: (...args: unknown[]) => mockUseSortable(...args),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: (transform: { x: number; y: number } | null) =>
        transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    },
  },
}));

jest.mock('./TaskCard', () => ({
  __esModule: true,
  default: ({ task }: { task: { title: string } }) => <div>{task.title}</div>,
}));

describe('DraggableTaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSortable.mockReturnValue({
      attributes: { 'data-sortable': 'yes' },
      listeners: { onPointerDown: jest.fn() },
      setNodeRef: jest.fn(),
      transform: { x: 12, y: 24 },
      transition: 'transform 150ms ease',
      isDragging: true,
    });
  });

  it('wires sortable metadata and drag styles into the wrapper', () => {
    render(
      <DraggableTaskCard
        task={{
          id: 'task-1',
          title: 'Tarea draggable',
          description: 'Descripcion',
          status: 'pending',
          favorite: false,
          createdBy: 'user-1',
          createdAt: 1,
          updatedAt: 1,
          version: 1,
        }}
      />,
    );

    expect(mockUseSortable).toHaveBeenCalledWith({
      id: 'task-1',
      data: {
        type: 'task',
        taskId: 'task-1',
        columnId: 'pending',
      },
    });

    const wrapper = screen.getByText('Tarea draggable').parentElement;

    expect(wrapper).toHaveAttribute('data-sortable', 'yes');
    expect(wrapper).toHaveStyle({
      transform: 'translate3d(12px, 24px, 0)',
      transition: 'transform 150ms ease',
      opacity: '0.5',
    });
  });
});