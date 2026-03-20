'use client';

import styled from 'styled-components';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';

const LoginPageWrapper = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.bgcian};
`;

const HeaderLogo = styled.header`
    width: 100%;
    height: 69px;
    display: flex;
    justify-content: center;
    align-items: center;
    `;

const ImageLogo = styled.div`
  width: 125px;
  overflow: hidden;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const MainContent = styled.section`
    width: 100%;
    max-width: 1100px;
    padding: 0 ${({ theme }) => theme.spacing.xl};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;

    @media (max-width: 900px) {
        flex-direction: column;
    }
`;

const FormContent = styled.div`
    flex: 1 1 300px;
`;

const SideIllustration = styled.div`
    flex: 1 1 300px;

    flex-shrink: 0;

    @media (max-width: 900px) {
        display: none;
    }
`;

const Footer = styled.footer`
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${({ theme }) => theme.spacing.xl};
    color: ${({ theme }) => theme.colors.footerText};
    background-color: ${({ theme }) => theme.colors.white};
`;

const SocialLinks = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
`;

const SOCIAL_LINKS = [
    { href: 'https://twitter.com',   src: '/logo-twitter.webp',   alt: 'Twitter'   },
    { href: 'https://facebook.com',  src: '/logo-facebook.webp',  alt: 'Facebook'  },
    { href: 'https://instagram.com', src: '/logo-instagram.webp', alt: 'Instagram' },
    { href: 'https://linkedin.com',  src: '/logo-linkedin.webp',  alt: 'LinkedIn'  },
];

export default function LoginPage() {
    return (
        <LoginPageWrapper>
            <HeaderLogo>
                <ImageLogo>
                    <Image src="/logo.webp" alt="Login Image" width={100} height={100} priority style={{ objectFit: 'contain', width: '100%', height: 'auto' }} />
                </ImageLogo>
            </HeaderLogo>

            <MainContent>
                <FormContent>
                    <LoginForm />
                </FormContent>
                <SideIllustration>
                    <Image
                        src="/incados.webp"
                        alt="Ilustracion de bienvenida"
                        width={520}
                        height={360}
                    />
                </SideIllustration>
            </MainContent>
            

            <Footer>
                <span>© 2025 Copyright, Todos los derechos reservados</span>
                <SocialLinks>
                    {SOCIAL_LINKS.map(({ href, src, alt }) => (
                        <a key={alt} href={href} target="_blank" rel="noopener noreferrer">
                            <Image src={src} alt={alt} width={20} height={20} />
                        </a>
                    ))}
                </SocialLinks>
            </Footer>
        </LoginPageWrapper>
    );
}