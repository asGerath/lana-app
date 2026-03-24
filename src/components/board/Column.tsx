'use client';

import styled from 'styled-components';
import { Column as ColumnType, TaskNode } from '@/features/tasks/types';
import TaskCard from './TaskCard';

const ColumnWrapper = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 320px;
  display: grid;
  align-content: start;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ColumnTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.title};
  color: ${({ theme }) => theme.colors.black};
`;

const Badge = styled.span`
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const TaskList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

type ColumnProps = {
  column: ColumnType;
  tasks: TaskNode[];
};

export default function Column({ column, tasks }: ColumnProps) {
  return (
    <ColumnWrapper>
      <ColumnHeader>
        <ColumnTitle>{column.title}</ColumnTitle>
        <Badge>{tasks.length}</Badge>
      </ColumnHeader>

      <TaskList>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </TaskList>
    </ColumnWrapper>
  );
}