import React, { useState } from 'react';
import { Box, Button, Card as MuiCard, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import MIUIAlert from '../../MIUIAlert';
import { api } from '../../../server';
import { useColorScheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles?.('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function VerificationCard({ email, password, onVerified }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ open: false, type: 'error', message: '' });
  const [alertKey, setAlertKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const navigate = useNavigate();

  const handleAlertClose = (_, reason) => {
    if (reason !== 'clickaway') setAlert((a) => ({ ...a, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAlert({ open: false, type: 'error', message: '' });
    if (!code.trim()) {
      setError('Please enter the code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${api}/v1/api/user/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ open: true, type: 'success', message: data.message || 'Email verified! Logging you in...' });
        setAlertKey((k) => k + 1);
        // Auto-login after verification if password is provided
        if (password) {
          // Try to log in
          const loginRes = await fetch(`${api}/v1/api/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username: email, password }),
            credentials: 'include',
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.data && loginData.data.accessToken) {
            navigate('/');
            return;
          } else {
            setAlert({ open: true, type: 'error', message: loginData.message || 'Verification succeeded, but login failed. Please log in manually.' });
            setAlertKey((k) => k + 1);
          }
        }
        if (onVerified) onVerified();
      } else {
        setAlert({ open: true, type: 'error', message: data.message || 'Verification failed.' });
        setAlertKey((k) => k + 1);
      }
    } catch (err) {
      setAlert({ open: true, type: 'error', message: 'Verification failed.' });
      setAlertKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setTimeout(() => setResendDisabled(false), 30000); // 30 seconds
    try {
      const res = await fetch(`${api}/v1/api/user/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ open: true, type: 'success', message: data.message || 'A new code has been sent.' });
        setAlertKey((k) => k + 1);
      } else {
        setAlert({ open: true, type: 'error', message: data.message || 'Failed to resend code.' });
        setAlertKey((k) => k + 1);
      }
    } catch (err) {
      setAlert({ open: true, type: 'error', message: 'Failed to resend code.' });
      setAlertKey((k) => k + 1);
    }
  };

  return (
    <>
      <MIUIAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={handleAlertClose}
        alertKey={alertKey}
      />
      <Card variant="outlined">
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
          Email Verification
        </Typography>
        <Typography sx={{ mb: 2, textAlign: 'center' }}>
          Enter the 6-digit code sent to <b>{email}</b>
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Verification Code"
            value={code}
            onChange={e => setCode(e.target.value)}
            error={!!error}
            helperText={error}
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            fullWidth
            autoFocus
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            Verify
          </Button>
          <Button variant="text" color="secondary" fullWidth onClick={handleResend} disabled={resendDisabled} sx={{ mt: 1 }}>
            Resend Code{resendDisabled ? ' (wait 30s)' : ''}
          </Button>
        </Box>
      </Card>
    </>
  );
} 