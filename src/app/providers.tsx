'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { store } from '@/store';
import { theme } from '@/styles/theme';
import GlobalStyles from '@/styles/globalStyles';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </Provider>
  );
}