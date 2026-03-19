'use client';

import { createGlobalStyle } from 'styled-components';

const globalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    min-height: 100%;
    font-family: Arial, Helvetica, sans-serif;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }

  body {
    overflow-x: hidden;
  }

  button, input, textarea, select {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default globalStyles;