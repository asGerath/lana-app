'use client';

import { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTask, setTasksError } from '@/store/slices/tasksSlice';
import { buildTaskNode, taskTitleExists } from '@/features/tasks/task-helpers';
import { ColumnId } from '@/features/tasks/types';

const FormWrapper = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: 1.25rem;
`;

const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  resize: vertical;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
`;

const Button = styled.button`
  width: fit-content;
  border: none;
  padding: 12px 18px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  cursor: pointer;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.95rem;
`;

export default function TaskForm() {
  const dispatch = useAppDispatch();
  const { board, error } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ColumnId>('pending');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      dispatch(setTasksError('No hay un usuario autenticado.'));
      return;
    }

    if (!title.trim()) {
      dispatch(setTasksError('El nombre de la tarea es obligatorio.'));
      return;
    }

    if (taskTitleExists(board, title)) {
      dispatch(setTasksError('Ya existe una tarea con ese nombre.'));
      return;
    }

    const task = buildTaskNode({
      title,
      description,
      status,
      createdBy: user.id,
    });

    dispatch(createTask({ task }));
    dispatch(setTasksError(null));

    setTitle('');
    setDescription('');
    setStatus('pending');
  };

  return (
    <FormWrapper>
      <Title>Crear nueva tarea</Title>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Label htmlFor="task-title">Nombre</Label>
          <Input
            id="task-title"
            type="text"
            placeholder="Ej. Revisar flujo de login"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Row>

        <Row>
          <Label htmlFor="task-description">Descripción</Label>
          <TextArea
            id="task-description"
            placeholder="Describe brevemente la tarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Row>

        <Row>
          <Label htmlFor="task-status">Estado inicial</Label>
          <Select
            id="task-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ColumnId)}
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completado</option>
          </Select>
        </Row>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <Button type="submit">Agregar tarea</Button>
      </Form>
    </FormWrapper>
  );
}