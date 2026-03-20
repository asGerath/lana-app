'use client';

import styled from 'styled-components';
import { useAppSelector } from '@/store/hooks';
import Column from './Column';
import { selectFilteredTasksByColumn } from '@/features/tasks/task.selectors';

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
  const state = useAppSelector((currentState) => currentState);

  return (
    <BoardGrid>
      {board.columnOrder.map((columnId) => {
        const column = board.columns[columnId];
        const tasks = selectFilteredTasksByColumn(state, columnId);

        return <Column key={column.id} column={column} tasks={tasks} />;
      })}
    </BoardGrid>
  );
}