'use client';

import styled from 'styled-components';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectFilteredTasksByColumn } from '@/features/tasks/task.selectors';
import { moveTask } from '@/store/slices/tasksSlice';
import DroppableColumn from './DroppableColumn';
import { ColumnId } from '@/features/tasks/types';

const BoardGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export default function Board() {
  const dispatch = useAppDispatch();
  const fullState = useAppSelector((state) => state);
  const { board } = useAppSelector((state) => state.tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeTaskId = String(active.id);
    const activeColumnId = active.data.current?.columnId as ColumnId | undefined;

    if (!activeColumnId) return;

    const sourceColumn = board.columns[activeColumnId];
    const sourceIndex = sourceColumn.taskIds.indexOf(activeTaskId);

    if (sourceIndex === -1) return;

    const overId = String(over.id);

    let destinationColumnId: ColumnId | undefined;
    let destinationIndex = -1;

    // Caso 1: cayó sobre una columna
    if (overId.startsWith('column-')) {
      destinationColumnId = overId.replace('column-', '') as ColumnId;
      destinationIndex = board.columns[destinationColumnId].taskIds.length;
    } else {
      // Caso 2: cayó sobre otra tarea
      for (const columnId of board.columnOrder) {
        const column = board.columns[columnId];
        const foundIndex = column.taskIds.indexOf(overId);

        if (foundIndex !== -1) {
          destinationColumnId = columnId;
          destinationIndex = foundIndex;
          break;
        }
      }
    }

    if (!destinationColumnId || destinationIndex === -1) return;

    // Evita dispatch innecesario si no cambió nada
    if (
      activeColumnId === destinationColumnId &&
      sourceIndex === destinationIndex
    ) {
      return;
    }

    dispatch(
      moveTask({
        taskId: activeTaskId,
        sourceColumnId: activeColumnId,
        destinationColumnId,
        sourceIndex,
        destinationIndex,
      }),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <BoardGrid>
        {board.columnOrder.map((columnId) => {
          const column = board.columns[columnId];
          const tasks = selectFilteredTasksByColumn(fullState, columnId);

          return (
            <DroppableColumn key={column.id} column={column} tasks={tasks} />
          );
        })}
      </BoardGrid>
    </DndContext>
  );
}