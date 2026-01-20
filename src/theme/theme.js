import { createTheme } from '@mui/material/styles';

// Color Palette
const colors = {
  // Primary Orange
  orange: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800', // main
    600: '#fb8c00',
    700: '#f57c00',
    800: '#e65100',
    900: '#bf360c',
  },
  // Neutral Grays
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Neutrals used in UI
  neutral: {
    white: '#ffffff',
    black: '#000000',
    lightGray: '#f5f5f5',
    mediumGray: '#666666',
    darkGray: '#424242',
    lightDarkGray: '#222222',
  },
  // Semantic
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#1976d2',
};

// Shadows
const shadows = {
  xs: '0 1px 4px rgba(0, 0, 0, 0.08)',
  sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
  md: '0 2px 8px rgba(255, 152, 0, 0.1)',
  lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
  orangeSm: '0 2px 8px rgba(255, 152, 0, 0.08)',
  orangeMd: '0 2px 8px rgba(255, 152, 0, 0.1)',
  orangeLg: '0 4px 12px rgba(255, 152, 0, 0.3)',
  orangeXl: '0 6px 16px rgba(255, 152, 0, 0.4)',
  orangeHeavy: '0 6px 20px rgba(255, 152, 0, 0.4)',
  negative: '-2px 0 8px rgba(0, 0, 0, 0.1)',
};

// Transitions
const transitions = {
  fast: 'all 0.2s ease',
  standard: 'all 0.3s ease',
};

// Spacing
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
};

// Border Radius
const borderRadius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.orange[500],
      light: colors.orange[300],
      dark: colors.orange[800],
    },
    secondary: {
      main: colors.orange[50],
      light: colors.orange[100],
    },
    background: {
      default: colors.gray[100],
      paper: colors.neutral.white,
    },
    text: {
      primary: colors.neutral.black,
      secondary: colors.gray[800],
    },
    success: { main: colors.success },
    error: { main: colors.error },
    warning: { main: colors.warning },
    info: { main: colors.info },
    divider: colors.orange[100],
  },
  shadows: shadows,
  transitions: transitions,
  borderRadius: borderRadius,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.orange[100]}`,
          boxShadow: shadows.orangeSm,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: shadows.sm,
        },
        elevation1: {
          boxShadow: shadows.md,
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: '0',
          overflow: 'hidden',
          border: 'none',
          backgroundColor: colors.orange[50],
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: colors.orange[100],
            backgroundImage: `linear-gradient(135deg, ${colors.orange[100]} 0%, ${colors.orange[200]} 100%)`,
            color: colors.neutral.black,
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: `2px solid ${colors.neutral.black}`,
            borderRight: `1px solid ${colors.neutral.black}`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
          '& .MuiTableCell-head:last-child': {
            borderRight: 'none',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            transition: `${transitions.fast} !important`,
          },
          '& .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-body': {
            backgroundColor: `${colors.neutral.white} !important`,
          },
          '& .MuiTableRow-root:nth-of-type(even) .MuiTableCell-body': {
            backgroundColor: `${colors.neutral.white} !important`,
          },
          '& .MuiTableRow-root:hover .MuiTableCell-body': {
            backgroundColor: `${colors.neutral.white} !important`,
          },
          '& .MuiTableCell-body': {
            borderBottom: `1px solid ${colors.neutral.black}`,
            borderRight: `1px solid ${colors.neutral.black}`,
            padding: `${spacing.md} ${spacing.lg}`,
            color: colors.neutral.black,
          },
          '& .MuiTableCell-body:last-child': {
            borderRight: 'none',
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: borderRadius.md,
          transition: transitions.standard,
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.orange[500]} 0%, ${colors.orange[300]} 100%)`,
          boxShadow: shadows.orangeLg,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.orange[800]} 0%, ${colors.orange[500]} 100%)`,
            boxShadow: shadows.orangeXl,
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: colors.orange[100],
          color: colors.orange[500],
          borderWidth: '2px',
          '&:hover': {
            backgroundColor: colors.orange[50],
            borderColor: colors.orange[300],
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.sm,
            transition: transitions.standard,
            '&:hover fieldset': {
              borderColor: colors.orange[100],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.orange[500],
              boxShadow: `0 0 0 3px rgba(255, 152, 0, 0.1)`,
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: shadows.negative,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow: shadows.lg,
          borderRadius: borderRadius.md,
          marginTop: spacing.sm,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            transition: transitions.fast,
            borderRadius: borderRadius.sm,
            '&:hover': {
              backgroundColor: colors.orange[50],
            },
          },
          '& .Mui-selected': {
            background: `linear-gradient(135deg, ${colors.orange[500]} 0%, ${colors.orange[300]} 100%)`,
            color: colors.neutral.white,
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.orange[800]} 0%, ${colors.orange[500]} 100%)`,
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: transitions.fast,
          '&:hover': {
            backgroundColor: colors.orange[50],
            paddingLeft: spacing.xl,
          },
          '&.Mui-selected': {
            backgroundColor: colors.orange[50],
            borderLeft: `4px solid ${colors.orange[500]}`,
            '&:hover': {
              backgroundColor: colors.orange[100],
            },
          },
        },
      },
    },
  },
});

// Export utilities for component usage
export const themeColors = colors;
export const themeShadows = shadows;
export const themeTransitions = transitions;
export const themeSpacing = spacing;
export const themeBorderRadius = borderRadius;

// Commonly used color shortcuts
export const themeUtils = {
  // Primary colors
  primary: colors.orange[500],
  primaryLight: colors.orange[300],
  primaryDark: colors.orange[800],
  
  // Neutral colors
  white: colors.neutral.white,
  black: colors.neutral.black,
  gray: colors.gray[600],
  lightGray: colors.gray[100],
  darkGray: colors.neutral.darkGray,
  
  // States
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
  
  // Transitions
  fast: transitions.fast,
  standard: transitions.standard,
  
  // Shadows
  shadowSm: shadows.sm,
  shadowMd: shadows.md,
  shadowLg: shadows.lg,
  shadowOrangeMd: shadows.orangeMd,
  shadowOrangeLg: shadows.orangeLg,
  
  // Borders
  borderRadius: borderRadius.md,
  borderRadiusSm: borderRadius.sm,
  borderRadiusLg: borderRadius.lg,
  
  // Spacing
  spacingSm: spacing.sm,
  spacingMd: spacing.md,
  spacingLg: spacing.lg,
};
