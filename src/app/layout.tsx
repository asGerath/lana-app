import type { Metadata } from 'next';
import StyledComponentsRegistry from '@/lib/styled-components-registry';
import Providers from './providers';
import SessionBootstrap from '@/components/auth/SessionBootstrap';

export const metadata: Metadata = {
  title: 'Task Board App',
  description: 'Technical test application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <StyledComponentsRegistry>
          <Providers>
            <SessionBootstrap />
            {children}
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}