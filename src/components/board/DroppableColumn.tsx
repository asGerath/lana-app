'use client';

import styled from 'styled-components';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, TaskNode } from '@/features/tasks/types';
import DraggableTaskCard from './DraggableTaskCard';

const ColumnWrapper = styled.section<{ $isOver: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme, $isOver }) =>
      $isOver ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 320px;
  display: grid;
  align-content: start;
  gap: ${({ theme }) => theme.spacing.lg};
  transition: border-color 0.2s ease;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ColumnTitle = styled.h2`
  font-size: 1.1rem;
`;

const Badge = styled.span`
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.9rem;
`;

const TaskList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 120px;
`;

type DroppableColumnProps = {
  column: ColumnType;
  tasks: TaskNode[];
};

export default function DroppableColumn({
  column,
  tasks,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  return (
    <ColumnWrapper ref={setNodeRef} $isOver={isOver}>
      <ColumnHeader>
        <ColumnTitle>{column.title}</ColumnTitle>
        <Badge>{tasks.length}</Badge>
      </ColumnHeader>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <TaskList>
          {tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} />
          ))}
        </TaskList>
      </SortableContext>
    </ColumnWrapper>
  );
}