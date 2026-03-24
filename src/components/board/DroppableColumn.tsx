'use client';

import { FormEvent, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, TaskNode } from '@/features/tasks/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { buildTaskNode, taskTitleExists } from '@/features/tasks/task-helpers';
import { createTask } from '@/store/slices/tasksSlice';
import { validateTaskTitleWithServer } from '@/features/tasks/task-title-validation.service';
import DraggableTaskCard from './DraggableTaskCard';

const ColumnWrapper = styled.section<{ $isOver: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid
    ${({ theme, $isOver }) =>
      $isOver ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 320px;
  min-width: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  transition: border-color 0.2s ease;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

const ColumnTitleGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

const ColumnTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.title};
  color: ${({ theme }) => theme.colors.black};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.softBg};
  border: 1px solid ${({ theme }) => theme.colors.panelBorder};
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
`;

const TaskList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 120px;
`;

const NewTaskText = styled.button`
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalCard = styled.div`
  width: min(100%, 520px);
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.black};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.black};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  outline: none;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  resize: vertical;
  outline: none;
`;

const ModalActions = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SecondaryButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 10px 14px;
  cursor: pointer;
`;

const PrimaryButton = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
`;

const ValidationMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const STATUS_ICON_BY_COLUMN = {
  pending: '/circle.png',
  in_progress: '/clock_loader_40.png',
  completed: '/check_circle.png',
} as const;

type DroppableColumnProps = {
  column: ColumnType;
  tasks: TaskNode[];
};

export default function DroppableColumn({
  column,
  tasks,
}: DroppableColumnProps) {
  const dispatch = useAppDispatch();
  const { board } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const taskCountLabel = `${tasks.length} ${tasks.length === 1 ? 'tarea' : 'tareas'}`;

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setError(null);
    setIsSubmitting(false);
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!user) {
      setError('No hay un usuario autenticado.');
      setIsSubmitting(false);
      return;
    }

    if (!title.trim()) {
      setError('El nombre de la tarea es obligatorio.');
      setIsSubmitting(false);
      return;
    }

    if (taskTitleExists(board, title)) {
      setError('Ya existe una tarea con ese nombre.');
      setIsSubmitting(false);
      return;
    }

    const validation = await validateTaskTitleWithServer(title);

    if (!validation.ok) {
      setError(validation.error);
      setIsSubmitting(false);
      return;
    }

    const task = buildTaskNode({
      title,
      description,
      status: column.id,
      createdBy: user.id,
    });

    dispatch(createTask({ task }));
    setIsSubmitting(false);
    closeModal();
  };

  return (
    <>
      <ColumnWrapper ref={setNodeRef} $isOver={isOver}>
        <ColumnHeader>
          <ColumnTitleGroup>
            <Image
              src={STATUS_ICON_BY_COLUMN[column.id]}
              alt={`Estado ${column.title}`}
              width={16}
              height={16}
            />
            <ColumnTitle>{column.title}</ColumnTitle>
          </ColumnTitleGroup>
          <Badge>{taskCountLabel}</Badge>
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

        <NewTaskText type="button" onClick={() => setIsModalOpen(true)}>
          + Nueva tarea
        </NewTaskText>
      </ColumnWrapper>

      {isModalOpen ? (
        <ModalOverlay onClick={closeModal}>
          <ModalCard onClick={(event) => event.stopPropagation()}>
            <ModalTitle>Nueva tarea en {column.title}</ModalTitle>

            <Form onSubmit={handleCreateTask}>
              <Label htmlFor={`task-title-${column.id}`}>Nombre</Label>
              <Input
                id={`task-title-${column.id}`}
                type="text"
                placeholder="Ej. Preparar propuesta UX"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <Label htmlFor={`task-description-${column.id}`}>Descripcion</Label>
              <TextArea
                id={`task-description-${column.id}`}
                placeholder="Describe brevemente la tarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />

              {error ? <ValidationMessage>{error}</ValidationMessage> : null}

              <ModalActions>
                <SecondaryButton type="button" onClick={closeModal}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Validando...' : 'Agregar tarea'}
                </PrimaryButton>
              </ModalActions>
            </Form>
          </ModalCard>
        </ModalOverlay>
      ) : null}
    </>
  );
}