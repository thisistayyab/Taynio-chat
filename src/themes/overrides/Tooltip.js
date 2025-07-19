// ==============================|| OVERRIDES - TOOLTIP ||============================== //

export default function Tooltip(theme) {
  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: theme.palette.mode === 'dark' ? '#fff' : '#181c2a',
          backgroundColor: theme.palette.mode === 'dark' ? '#232946' : '#fff',
          fontWeight: 500,
          fontFamily: 'Urbanist, sans-serif',
          fontSize: '1rem',
          boxShadow: theme.shadows[2],
        },
      },
    },
  };
}
