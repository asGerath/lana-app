import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      footerText: string;
      white: string;
      black: string;
      bgcian: string;
      bg: string;
      surface: string;
      card: string;
      primary: string;
      primaryHover: string;
      text: string;
      textMuted: string;
      danger: string;
      success: string;
      border: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    radius: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}