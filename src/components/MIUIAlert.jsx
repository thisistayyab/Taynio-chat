import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

const MIUIAlert = ({ open, type = 'success', message = '', onClose, alertKey, mode = 'light' }) => (
  <Snackbar
    key={alertKey}
    open={open}
    autoHideDuration={5000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    TransitionComponent={TransitionDown}
    sx={{
      '& .MuiAlert-root': {
        border: '1.5px solid',
        borderColor: (theme) => theme.palette[type]?.main || '#2196f3',
        background: mode === 'dark' ? 'rgba(24,28,42,0.98)' : 'rgba(255,255,255,0.95)',
        color: mode === 'dark' ? '#fff' : (theme) => theme.palette[type]?.main || '#2196f3',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        fontWeight: 500,
        alignItems: 'center',
        minWidth: 320,
        maxWidth: 420,
        borderRadius: 2,
      }
    }}
  >
    <MuiAlert
      elevation={0}
      variant="outlined"
      severity={type}
      onClose={onClose}
      sx={{
        width: '100%',
        border: 'none',
        background: 'transparent',
        color: mode === 'dark' ? '#fff' : (theme) => theme.palette[type]?.main || '#2196f3',
        fontWeight: 500,
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        boxSizing: 'border-box',
      }}
      action={
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            ml: 1,
            color: mode === 'dark' ? '#fff' : (theme) => theme.palette[type]?.main || '#2196f3',
            borderRadius: 1.5,
            transition: 'background 0.2s',
            '&:hover': {
              background: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            },
            padding: '4px',
            fontSize: 22
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      {message}
    </MuiAlert>
  </Snackbar>
);

export default MIUIAlert; 