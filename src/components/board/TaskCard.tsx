'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { TaskNode } from '@/features/tasks/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    deleteTask,
    moveTask,
    setTasksError,
    toggleFavorite,
    updateTask,
} from '@/store/slices/tasksSlice';
import { taskTitleExists } from '@/features/tasks/task-helpers';
import { ColumnId } from '@/features/tasks/types';
import { validateTaskTitleWithServer } from '@/features/tasks/task-title-validation.service';

const Card = styled.article`
    background: #f3f4f6;
    border: 1px solid #dde1e7;
    border-radius: 12px;
    padding: 16px;
    display: grid;
    gap: 12px;
    min-width: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
    align-items: center;
    gap: 10px;
    min-width: 0;
`;

const Lead = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
`;

const Handle = styled.span`
    width: 32px;
    height: 32px;
    border-radius: 2px;
    background: #eceff3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const Title = styled.h3`
    font-size: clamp(1.05rem, 1.4vw, 1.85rem);
    line-height: 1.18;
    color: #0b1220;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Description = styled.p`
    color: #4d535f;
    font-size: clamp(0.96rem, 1.15vw, 1.05rem);
    line-height: 1.35;
    margin-left: 44px;
    overflow-wrap: anywhere;
    word-break: break-word;
`;

const Meta = styled.small`
    color: #7a8799;
    margin-left: 44px;
    overflow-wrap: anywhere;
    word-break: break-word;
`;

const TitleWrap = styled.div`
    min-width: 0;
`;

const CardFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 2px;
    margin-left: 44px;
    min-width: 0;
`;

const AvatarStack = styled.div`
    display: flex;
    align-items: center;
`;

const Avatar = styled.span<{ $shift: number }>`
    width: 30px;
    height: 30px;
    border-radius: 999px;
    border: 2px solid #f3f4f6;
    overflow: hidden;
    margin-left: ${({ $shift }) => `${$shift}px`};
`;

const DateChip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #d3d7de;
    border-radius: 10px;
    background: #f6f7f9;
    padding: 6px 12px;
    color: #4b5563;
    font-weight: 600;
    flex-shrink: 0;
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

const MenuDivider = styled.hr`
    border: none;
    border-top: 1px solid rgba(15, 23, 42, 0.1);
    margin: 4px 0;
`;

const MoveHeader = styled.button`
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    padding: 9px 10px;
    border-radius: ${({ theme }) => theme.radius.sm};
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:hover,
    &:focus-visible {
        background: rgba(15, 23, 42, 0.08);
        outline: none;
    }
`;

const SubMenuItem = styled.button`
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    padding: 8px 10px 8px 20px;
    border-radius: ${({ theme }) => theme.radius.sm};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
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
    const [isMoveOpen, setIsMoveOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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

    const handleSaveEdit = async () => {
        if (isSaving) return;

        setIsSaving(true);

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            dispatch(setTasksError('El nombre de la tarea es obligatorio.'));
            setIsSaving(false);
            return;
        }

        const duplicatedTitle = Object.values(board.tasksById).some(
            (currentTask) =>
                currentTask.id !== task.id &&
                currentTask.title.trim().toLowerCase() === trimmedTitle.toLowerCase(),
        );

        if (duplicatedTitle || (trimmedTitle !== task.title && taskTitleExists(board, trimmedTitle))) {
            dispatch(setTasksError('Ya existe una tarea con ese nombre.'));
            setIsSaving(false);
            return;
        }

        const validation = await validateTaskTitleWithServer(trimmedTitle);

        if (!validation.ok) {
            dispatch(setTasksError(validation.error));
            setIsSaving(false);
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
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setTitle(task.title);
        setDescription(task.description ?? '');
        setIsSaving(false);
        setIsEditing(false);
    };

    const openEdit = () => {
        setIsEditing(true);
        setIsMenuOpen(false);
        setIsMoveOpen(false);
    };

    const onDeleteFromMenu = () => {
        setIsMenuOpen(false);
        setIsMoveOpen(false);
        handleDelete();
    };

    const handleMoveToColumn = (destinationColumnId: ColumnId) => {
        const sourceColumn = board.columns[task.status];
        const sourceIndex = sourceColumn.taskIds.indexOf(task.id);

        if (sourceIndex === -1) return;

        const destinationIndex = board.columns[destinationColumnId].taskIds.length;

        dispatch(
            moveTask({
                taskId: task.id,
                sourceColumnId: task.status,
                destinationColumnId,
                sourceIndex,
                destinationIndex,
            }),
        );

        setIsMenuOpen(false);
        setIsMoveOpen(false);
    };

    const targetColumns = board.columnOrder.filter((columnId) => columnId !== task.status);
    const createdDate = new Date(task.createdAt);
    const monthName = createdDate.toLocaleDateString('es-ES', { month: 'long' });
    const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const readableDate = `${monthCapitalized} ${createdDate.getDate()}`;

    return (
        <Card>
            <Header>
                <Lead>
                    <Handle>
                        <Image src="/two_barras.webp" alt="Mover" width={18} height={18} />
                    </Handle>

                    <TitleWrap>
                        <Title>
                            {task.title} {task.favorite ? <FavoriteBadge>⭐</FavoriteBadge> : null}
                        </Title>
                    </TitleWrap>
                </Lead>

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
                            <MenuDivider />
                            <MoveHeader
                                type="button"
                                role="menuitem"
                                aria-expanded={isMoveOpen}
                                onClick={() => setIsMoveOpen((prev) => !prev)}
                            >
                                Mover a
                                <span>{isMoveOpen ? '▲' : '▶'}</span>
                            </MoveHeader>
                            {isMoveOpen
                                ? targetColumns.map((columnId) => (
                                      <SubMenuItem
                                          key={columnId}
                                          type="button"
                                          role="menuitem"
                                          onClick={() => handleMoveToColumn(columnId)}
                                      >
                                          {board.columns[columnId].title}
                                      </SubMenuItem>
                                  ))
                                : null}
                            <MenuDivider />
                            <MenuItem type="button" role="menuitem" $danger onClick={onDeleteFromMenu}>
                                Eliminar
                            </MenuItem>
                        </Menu>
                    ) : null}
                </MenuWrapper>
            </Header>

            {task.description ? <Description>{task.description}</Description> : null}

            <CardFooter>
                <AvatarStack>
                    <Avatar $shift={0}>
                        <Image src="/user.webp" alt="Participante 1" width={30} height={30} />
                    </Avatar>
                    <Avatar $shift={-9}>
                        <Image src="/user.webp" alt="Participante 2" width={30} height={30} />
                    </Avatar>
                    <Avatar $shift={-9}>
                        <Image src="/user.webp" alt="Participante 3" width={30} height={30} />
                    </Avatar>
                </AvatarStack>

                <DateChip>
                    <Image src="/event.webp" alt="Fecha" width={18} height={18} />
                    {readableDate}
                </DateChip>
            </CardFooter>

            <Meta>Version: {task.version}</Meta>

            {isEditing ? (
                <EditForm>
                    <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                    <TextArea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />

                    <Actions>
                        <Button type="button" onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving ? 'Validando...' : 'Guardar'}
                        </Button>
                        <Button type="button" onClick={handleCancelEdit} disabled={isSaving}>
                            Cancelar
                        </Button>
                    </Actions>
                </EditForm>
            ) : null}
        </Card>
    );
}