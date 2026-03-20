'use client';

import styled from 'styled-components';
import { TaskNode } from '@/features/tasks/types';

const Card = styled.article`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h3`
  font-size: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.95rem;
`;

const Meta = styled.small`
  color: ${({ theme }) => theme.colors.textMuted};
`;

type TaskCardProps = {
  task: TaskNode;
};

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <Card>
      <Title>{task.title}</Title>
      {task.description ? <Description>{task.description}</Description> : null}
      <Meta>Versión: {task.version}</Meta>
    </Card>
  );
}