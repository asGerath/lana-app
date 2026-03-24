'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import TaskFilters from '@/components/board/TaskFilters';

type BoardNavProps = {
    userName: string;
    onLogout: () => void;
};

const NavContainer = styled.header`
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0;
  padding: 8px 12px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas: 'left center right';
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 980px) {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'left right'
      'center center';
    row-gap: 12px;
  }
`;

const Left = styled.div`
  grid-area: left;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`;

const Center = styled.div`
  grid-area: center;
  min-width: 0;
`;

const MenuIconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: #eef4ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: .5rem;
`;

const Brand = styled.div`
  display: inline-flex;
  align-items: center;
`;

const Right = styled.div`
  grid-area: right;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-self: end;
`;

const CircleIconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #dadde3;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: #f7f8fa;
    outline: none;
  }
`;

const UserMenuRoot = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  border: 1px solid #dadde3;
  background: #ffffff;
  border-radius: 999px;
  height: 40px;
  padding: 0 8px 0 3px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: #f7f8fa;
    outline: none;
  }
`;

const UserAvatar = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 999px;
  overflow: hidden;
  display: inline-flex;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 190px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  padding: 8px;
  z-index: 25;
`;

const UserName = styled.p`
  font-size: 0.9rem;
  color: #0f172a;
  font-weight: 600;
  padding: 8px;
`;

const LogoutButton = styled.button`
  width: 100%;
  border: none;
  background: #fff1f2;
  color: #be123c;
  border-radius: 8px;
  padding: 9px 10px;
  text-align: left;
  font-weight: 600;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: #ffe4e6;
    outline: none;
  }
`;

const HiddenOnMobile = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 700px) {
    display: none;
  }
`;

export default function BoardNav({ userName, onLogout }: BoardNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            if (!menuRef.current) return;

            if (!menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
        };
    }, []);

    return (
        <NavContainer>
          <Left>
            <MenuIconButton type="button" aria-label="Abrir menu">
              <Image src="/notes.png" alt="Menu" width={16} height={16} style={{ objectFit: 'contain', width: '100%', height: 'auto' }} />
            </MenuIconButton>

            <Brand>
              <Image src="/logo.webp" alt="Logo" width={84} height={30} priority />
            </Brand>
          </Left>

          <Center>
            <TaskFilters />
          </Center>

          <Right>
            <HiddenOnMobile>
              <CircleIconButton type="button" aria-label="Mensajes">
                <Image src="/New_messages.webp" alt="Mensajes" width={24} height={24} />
              </CircleIconButton>

              <CircleIconButton type="button" aria-label="Notificaciones">
                <Image src="/notification.webp" alt="Notificaciones" width={24} height={24} />
              </CircleIconButton>
            </HiddenOnMobile>

            <UserMenuRoot ref={menuRef}>
              <UserButton
                type="button"
                aria-label="Abrir menu de usuario"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <UserAvatar>
                  <Image src="/user.webp" alt="Usuario" width={32} height={32} />
                </UserAvatar>
                <Image src="/Down.webp" alt="Expandir" width={20} height={20} />
              </UserButton>

              {isOpen ? (
                <Dropdown role="menu" aria-label="Opciones de usuario">
                  <UserName>{userName}</UserName>
                  <LogoutButton
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsOpen(false);
                      onLogout();
                    }}
                  >
                    Cerrar sesion
                  </LogoutButton>
                </Dropdown>
              ) : null}
            </UserMenuRoot>
          </Right>
        </NavContainer>
    );
}
