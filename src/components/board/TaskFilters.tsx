'use client';

import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearch, setSelectedStatus } from '@/store/slices/tasksSlice';
import { ColumnId } from '@/features/tasks/types';

const FiltersWrapper = styled.section`
  display: grid;
  grid-template-columns: 1.5fr 220px;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
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

export default function TaskFilters() {
  const dispatch = useAppDispatch();
  const { search, selectedStatus } = useAppSelector((state) => state.tasks);

  return (
    <FiltersWrapper>
      <Input
        type="text"
        placeholder="Buscar por nombre o descripción"
        value={search}
        onChange={(event) => dispatch(setSearch(event.target.value))}
      />

      <Select
        value={selectedStatus}
        onChange={(event) =>
          dispatch(setSelectedStatus(event.target.value as ColumnId | 'all'))
        }
      >
        <option value="all">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="in_progress">En progreso</option>
        <option value="completed">Completado</option>
      </Select>
    </FiltersWrapper>
  );
}