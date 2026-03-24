'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearch, setSelectedStatus } from '@/store/slices/tasksSlice';
import { TaskFilter } from '@/features/tasks/types';

const FiltersWrapper = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  position: relative;
  display: block;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const LeadingIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const TrailingIcon = styled(LeadingIcon)`
  left: auto;
  right: 12px;
`;

const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 14px 0 40px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.softBorder};
  background: ${({ theme }) => theme.colors.softBgAlt};
  color: ${({ theme }) => theme.colors.mutedStrong};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focusRing};
    background: ${({ theme }) => theme.colors.white};
  }
`;

const Select = styled.select`
  width: 100%;
  height: 44px;
  padding: 0 38px 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.softBorder};
  background: ${({ theme }) => theme.colors.softBgAlt};
  color: ${({ theme }) => theme.colors.mutedStrong};
  font-weight: 500;
  appearance: none;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focusRing};
    background: ${({ theme }) => theme.colors.white};
  }
`;

export default function TaskFilters() {
  const dispatch = useAppDispatch();
  const { search, selectedStatus } = useAppSelector((state) => state.tasks);

  return (
    <FiltersWrapper>
      <Field>
        <LeadingIcon>
          <Image src="/search.webp" alt="Buscar" width={16} height={16} />
        </LeadingIcon>
        <Input
          type="text"
          placeholder="Buscar por nombre o descripción"
          value={search}
          onChange={(event) => dispatch(setSearch(event.target.value))}
        />
      </Field>

      <Field>
        <Select
          value={selectedStatus}
          onChange={(event) =>
            dispatch(setSelectedStatus(event.target.value as TaskFilter))
          }
        >
          <option value="all">Todos los estados</option>
          <option value="favorites">Favoritos</option>
          <option value="pending">Pendiente</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completado</option>
        </Select>
        <TrailingIcon>
          <Image src="/Down.webp" alt="Abrir" width={12} height={12} />
        </TrailingIcon>
      </Field>
    </FiltersWrapper>
  );
}