import type { Metadata } from 'next';
import { Red_Hat_Display } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/styled-components-registry';
import Providers from './providers';
import SessionBootstrap from '@/components/auth/SessionBootstrap';

const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

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
      <body className={redHatDisplay.className}>
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