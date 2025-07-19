import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { CssVarsProvider, useColorScheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Palette from './palette';
import Typography from './typography';
import CustomShadows from './shadows';
import componentsOverride from './overrides';
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

// ==============================|| DEFAULT THEME - MAIN ||============================== //

export default function ThemeCustomization({ children }) {
  return (
    <CssVarsProvider defaultMode="light" modeStorageKey="taylance-crm-color-mode">
      <ThemeWithMode>{children}</ThemeWithMode>
    </CssVarsProvider>
  );
}

function ThemeWithMode({ children }) {
  const { mode = 'light' } = useColorScheme();
  // Only allow 'light' or 'dark' for Palette
  let paletteMode = mode;
  if (mode === 'system') {
    paletteMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  const baseTheme = Palette(paletteMode, 'default');
  const themeTypography = Typography(`'Urbanist', sans-serif`);
  const themeCustomShadows = useMemo(() => CustomShadows(baseTheme), [baseTheme]);
  const themeOptions = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 768,
          md: 1024,
          lg: 1266,
          xl: 1440
        }
      },
      direction: 'ltr',
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8
        }
      },
      palette: baseTheme.palette,
      customShadows: themeCustomShadows,
      typography: themeTypography
    }),
    [baseTheme, themeTypography, themeCustomShadows]
  );
  // Create the theme first so it has all MUI utilities
  const theme = createTheme({
    ...baseTheme,
    ...themeOptions,
  });
  // Now set components, passing the full theme object
  theme.components = {
    ...componentsOverride(theme),
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: paletteMode === 'dark' ? '#555 #1e1e1e' : undefined,
          fontFamily: 'Urbanist, sans-serif',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
          backgroundColor: paletteMode === 'dark' ? '#1e1e1e' : undefined,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: paletteMode === 'dark' ? '#1e1e1e' : undefined,
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: paletteMode === 'dark' ? '#1e1e1e' : undefined,
        },
        body: {
          fontFamily: 'Urbanist, sans-serif',
          ...(paletteMode === 'dark' && {
            backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }),
        },
      },
    },
  };
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

ThemeWithMode.propTypes = { children: PropTypes.node };
ThemeCustomization.propTypes = { children: PropTypes.node };
