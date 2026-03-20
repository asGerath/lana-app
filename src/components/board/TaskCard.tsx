'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { TaskNode } from '@/features/tasks/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteTask,
  setTasksError,
  toggleFavorite,
  updateTask,
} from '@/store/slices/tasksSlice';
import { taskTitleExists } from '@/features/tasks/task-helpers';

const Card = styled.article`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
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

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const Button = styled.button`
  border: none;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const DangerButton = styled(Button)`
  background: ${({ theme }) => theme.colors.danger};
`;

const FavoriteBadge = styled.span`
  font-size: 1rem;
`;

const EditForm = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
`;

type TaskCardProps = {
  task: TaskNode;
};

export default function TaskCard({ task }: TaskCardProps) {
  const dispatch = useAppDispatch();
  const { board } = useAppSelector((state) => state.tasks);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');

  const handleDelete = () => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la tarea "${task.title}"?`,
    );

    if (!confirmed) return;

    dispatch(deleteTask({ id: task.id }));
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite({ id: task.id }));
  };

  const handleSaveEdit = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      dispatch(setTasksError('El nombre de la tarea es obligatorio.'));
      return;
    }

    const duplicatedTitle = Object.values(board.tasksById).some(
      (currentTask) =>
        currentTask.id !== task.id &&
        currentTask.title.trim().toLowerCase() === trimmedTitle.toLowerCase(),
    );

    if (duplicatedTitle || (trimmedTitle !== task.title && taskTitleExists(board, trimmedTitle))) {
      dispatch(setTasksError('Ya existe una tarea con ese nombre.'));
      return;
    }

    dispatch(
      updateTask({
        id: task.id,
        changes: {
          title: trimmedTitle,
          description: description.trim(),
        },
      }),
    );

    dispatch(setTasksError(null));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setIsEditing(false);
  };

  return (
    <Card>
      <Header>
        <div>
          <Title>
            {task.title} {task.favorite ? <FavoriteBadge>⭐</FavoriteBadge> : null}
          </Title>
        </div>
      </Header>

      {task.description ? <Description>{task.description}</Description> : null}

      <Meta>Versión: {task.version}</Meta>

      <Actions>
        <Button type="button" onClick={handleToggleFavorite}>
          {task.favorite ? 'Quitar favorito' : 'Favorito'}
        </Button>

        {!isEditing ? (
          <Button type="button" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        ) : null}

        <DangerButton type="button" onClick={handleDelete}>
          Eliminar
        </DangerButton>
      </Actions>

      {isEditing ? (
        <EditForm>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          <TextArea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <Actions>
            <Button type="button" onClick={handleSaveEdit}>
              Guardar
            </Button>
            <Button type="button" onClick={handleCancelEdit}>
              Cancelar
            </Button>
          </Actions>
        </EditForm>
      ) : null}
    </Card>
  );
}