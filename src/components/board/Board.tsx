'use client';

import styled from 'styled-components';
import { useAppSelector } from '@/store/hooks';
import Column from './Column';

const BoardGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export default function Board() {
  const { board } = useAppSelector((state) => state.tasks);

  return (
    <BoardGrid>
      {board.columnOrder.map((columnId) => {
        const column = board.columns[columnId];
        const tasks = column.taskIds
          .map((taskId) => board.tasksById[taskId])
          .filter(Boolean);

        return <Column key={column.id} column={column} tasks={tasks} />;
      })}
    </BoardGrid>
  );
}