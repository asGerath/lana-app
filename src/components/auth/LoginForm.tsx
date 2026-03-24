'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  APP_DEMO_CREDENTIALS,
  DEMO_REQRES_USER,
} from '@/features/auth/demo-credentials';
import { loginRequest } from '@/features/auth/auth.service';
import { saveSessionToStorage } from '@/features/auth/auth-storage';
import { loginSuccess, setAuthError, setAuthLoading } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const LoginWrapper = styled.div`
  width: 100%;
  text-align: center;
  max-width: 420px;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: 0px -5px 33px 1px #C9DBFD4F;
`;

const Eyebrow = styled.span`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.black};
  font-size: 20px;
  font-weight: 500;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.black};
  font-weight: 500;

`;

const SocialButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SocialButton = styled.button`
  width: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  font-weight: 600;
  cursor: pointer;

  &:hover {
    filter: brightness(0.98);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.black};
  font-size: 0.95rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.black};
  font-size: 0.95rem;
`;

const HelperText = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.black};
  font-size: 0.9rem;
`;

export default function LoginForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState<string>(APP_DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState<string>(APP_DEMO_CREDENTIALS.password);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            dispatch(setAuthError('Email y password son obligatorios.'));
            return;
        }

        dispatch(setAuthLoading(true));
        dispatch(setAuthError(null));

        try {
            const response = await loginRequest({ email, password });

            const user = {
              id: DEMO_REQRES_USER.id,
                email,
              name: DEMO_REQRES_USER.name,
            };

            const persistedSession = saveSessionToStorage(user, response.token);

            if (!persistedSession) {
                throw new Error('No se pudo guardar la sesión.');
            }

            dispatch(
                loginSuccess({
                    user: persistedSession.user,
                    session: persistedSession.session,
                }),
            );

            router.push('/board');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión.';

            dispatch(setAuthError(message));
            dispatch(setAuthLoading(false));
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/board');
        }
    }, [isAuthenticated, router]);


    return (
        <LoginWrapper>

            <Eyebrow>Bienvenido</Eyebrow>
            <Title>Iniciar sesión</Title>

          <SocialButtons>
            <SocialButton type="button">
              <Image src="/Google.webp" alt="Google" width={20} height={20} />
              <span>Inicia sesión con Google</span>
            </SocialButton>

            <SocialButton type="button">
              <Image src="/Facebook.webp" alt="Facebook" width={20} height={20} />
              <span>Inicia sesión con Facebook</span>
            </SocialButton>
          </SocialButtons>

          <Divider>o</Divider>

            <Form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </FieldGroup>

                <FieldGroup>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </FieldGroup>

                {error ? <ErrorMessage>{error}</ErrorMessage> : null}

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Ingresando...' : 'Ingresar'}
                </Button>
            </Form>

            <HelperText>
              Credenciales demo: <br /> {APP_DEMO_CREDENTIALS.email} / {APP_DEMO_CREDENTIALS.password}
            </HelperText>
        </LoginWrapper>
    );
}