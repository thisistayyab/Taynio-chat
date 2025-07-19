import React, { useState } from 'react';
import { Box, Button, Card as MuiCard, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import MIUIAlert from '../../MIUIAlert';
import { api } from '../../../server';
import { useColorScheme } from '@mui/material/styles';

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

export default function ForgotPasswordCard({ onSuccess }) {
  const [step, setStep] = useState(1); // 1: enter email, 2: enter code/new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ open: false, type: 'error', message: '' });
  const [alertKey, setAlertKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;

  const handleAlertClose = (_, reason) => {
    if (reason !== 'clickaway') setAlert((a) => ({ ...a, open: false }));
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setAlert({ open: false, type: 'error', message: '' });
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${api}/v1/api/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ open: true, type: 'success', message: data.message || 'If an account exists, a reset code has been sent.' });
        setAlertKey((k) => k + 1);
        setStep(2);
      } else if (res.status === 404) {
        setError(data.message || 'No account found with that email.');
      } else {
        setAlert({ open: true, type: 'error', message: data.message || 'Failed to send reset code.' });
        setAlertKey((k) => k + 1);
      }
    } catch (err) {
      setAlert({ open: true, type: 'error', message: 'Failed to send reset code.' });
      setAlertKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setTimeout(() => setResendDisabled(false), 30000); // 30 seconds
    try {
      const res = await fetch(`${api}/v1/api/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setAlert({ open: true, type: 'success', message: data.message || 'A new code has been sent.' });
      setAlertKey((k) => k + 1);
    } catch (err) {
      setAlert({ open: true, type: 'error', message: 'Failed to resend code.' });
      setAlertKey((k) => k + 1);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setAlert({ open: false, type: 'error', message: '' });
    if (!code.trim() || !newPassword.trim()) {
      setError('Please enter the code and your new password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${api}/v1/api/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ open: true, type: 'success', message: data.message || 'Password reset! You can now log in.' });
        setAlertKey((k) => k + 1);
        if (onSuccess) onSuccess();
      } else {
        setAlert({ open: true, type: 'error', message: data.message || 'Failed to reset password.' });
        setAlertKey((k) => k + 1);
      }
    } catch (err) {
      setAlert({ open: true, type: 'error', message: 'Failed to reset password.' });
      setAlertKey((k) => k + 1);
    } finally {
      setLoading(false);
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
        mode={resolvedMode}
      />
      <Card variant="outlined">
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
          Forgot Password
        </Typography>
        {step === 1 ? (
          <Box component="form" onSubmit={handleRequestCode} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              fullWidth
              required
              error={!!error}
              helperText={error}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              Send Reset Code
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Verification Code"
              value={code}
              onChange={e => setCode(e.target.value)}
              inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
              fullWidth
              required
            />
            <TextField
              label="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              type="password"
              fullWidth
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              Reset Password
            </Button>
            <Button variant="text" color="secondary" fullWidth onClick={handleResend} disabled={resendDisabled} sx={{ mt: 1 }}>
              Resend Code{resendDisabled ? ' (wait 30s)' : ''}
            </Button>
          </Box>
        )}
      </Card>
    </>
  );
} 