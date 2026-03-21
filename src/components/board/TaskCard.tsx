'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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
    background: #f8fafc;
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
    color: ${({ theme }) => theme.colors.black};
`;

const Description = styled.p`
    color: #5f6b7a;
  font-size: 0.95rem;
`;

const Meta = styled.small`
    color: #7a8799;
`;

const TitleWrap = styled.div`
    min-width: 0;
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
    background: #1f3555;
    color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
`;

const DangerButton = styled(Button)`
  background: ${({ theme }) => theme.colors.danger};
`;

const MenuWrapper = styled.div`
    position: relative;
    flex-shrink: 0;
`;

const MenuButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: ${({ theme }) => theme.radius.sm};
    cursor: pointer;

    &:hover,
    &:focus-visible {
        background: rgba(15, 23, 42, 0.08);
        outline: none;
    }
`;

const Menu = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    width: 170px;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.md};
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
    padding: 6px;
    z-index: 15;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    padding: 9px 10px;
    border-radius: ${({ theme }) => theme.radius.sm};
    color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.text)};
    font-weight: 600;
    cursor: pointer;

    &:hover,
    &:focus-visible {
        background: rgba(15, 23, 42, 0.08);
        outline: none;
    }
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
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? '');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!menuRef.current) return;

            if (!menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDelete = () => {
        const confirmed = window.confirm(
            `¿Seguro que quieres eliminar la tarea "${task.title}"?`,
        );

        if (!confirmed) return;

        dispatch(deleteTask({ id: task.id }));
    };

    const handleToggleFavorite = () => {
        dispatch(toggleFavorite({ id: task.id }));
        setIsMenuOpen(false);
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
                expectedVersion: task.version,
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

    const openEdit = () => {
        setIsEditing(true);
        setIsMenuOpen(false);
    };

    const onDeleteFromMenu = () => {
        setIsMenuOpen(false);
        handleDelete();
    };

    return (
        <Card>
            <Header>
                <TitleWrap>
                    <Title>
                        {task.title} {task.favorite ? <FavoriteBadge>⭐</FavoriteBadge> : null}
                    </Title>
                </TitleWrap>

                <MenuWrapper ref={menuRef}>
                    <MenuButton
                        type="button"
                        aria-label="Abrir acciones de la tarea"
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((current) => !current)}
                    >
                        <Image src="/puntos.png" alt="Acciones" width={16} height={16} />
                    </MenuButton>

                    {isMenuOpen ? (
                        <Menu role="menu" aria-label="Acciones de tarea">
                            <MenuItem type="button" role="menuitem" onClick={handleToggleFavorite}>
                                {task.favorite ? 'Quitar favorito' : 'Favorito'}
                            </MenuItem>
                            <MenuItem type="button" role="menuitem" onClick={openEdit}>
                                Editar
                            </MenuItem>
                            <MenuItem type="button" role="menuitem" $danger onClick={onDeleteFromMenu}>
                                Eliminar
                            </MenuItem>
                        </Menu>
                    ) : null}
                </MenuWrapper>
            </Header>

            {task.description ? <Description>{task.description}</Description> : null}

            <Meta>Versión: {task.version}</Meta>

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