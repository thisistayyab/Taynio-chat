// ==============================|| OVERRIDES - MENU ||============================== //

export default function Menu(theme) {
  return {
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit',
        },
      },
    },
  };
} 