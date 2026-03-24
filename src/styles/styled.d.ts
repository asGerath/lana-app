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
      softBg: string;
      softBgAlt: string;
      softBorder: string;
      panelBorder: string;
      mutedStrong: string;
      muted: string;
      mutedLight: string;
      placeholder: string;
      inkTitle: string;
      inkSoft: string;
      inkMuted: string;
      chipBorder: string;
      chipBg: string;
      brandDark: string;
      navSoft: string;
      dangerSoft: string;
      dangerSoftHover: string;
      overlay: string;
      focusRing: string;
      menuHover: string;
      dividerSoft: string;
      shadowMd: string;
      shadowLg: string;
      loginShadow: string;
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
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      base: string;
      lg: string;
      xl: string;
      xxl: string;
      title: string;
      hero: string;
      eyebrow: string;
      taskTitleClamp: string;
      taskBodyClamp: string;
    };
  }
}