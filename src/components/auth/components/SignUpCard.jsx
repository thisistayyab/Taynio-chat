import React, { useState } from 'react';
import {
  Box,
  Button,
  Card as MuiCard,
  Divider,
  FormControl,
  FormLabel,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GoogleIcon, FacebookIcon } from './CustomIcons';
import logo from '../../../assets/images/logo.png';
import { useNavigate } from 'react-router-dom';
import MIUIAlert from '../../MIUIAlert';
import { api } from '../../../server';
import { useColorScheme } from '@mui/material/styles';
import VerificationCard from './VerificationCard';

const API_URL = `${api}/v1/api/user`;

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

export default function SignupCard() {
  const [signupData, setSignupData] = useState({
    fullname: '',
    email: '',
    username: '',
    password: '',
  });
  const [fullnameError, setFullnameError] = useState(false);
  const [fullnameErrorMessage, setFullnameErrorMessage] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [alert, setAlert] = useState({ open: false, type: 'error', message: '' });
  const [alertKey, setAlertKey] = useState(0);
  const navigate = useNavigate();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleAlertClose = (_, reason) => {
    if (reason !== 'clickaway') setAlert((a) => ({ ...a, open: false }));
  };

  const handleChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    // Clear error and message for the field being edited
    switch (e.target.name) {
      case 'fullname':
        setFullnameError(false);
        setFullnameErrorMessage('');
        break;
      case 'username':
        setUsernameError(false);
        setUsernameErrorMessage('');
        break;
      case 'email':
        setEmailError(false);
        setEmailErrorMessage('');
        break;
      case 'password':
        setPasswordError(false);
        setPasswordErrorMessage('');
        break;
      default:
        break;
    }
  };

  const validate = () => {
    let isValid = true;
    if (!signupData.fullname.trim()) {
      setFullnameError(true);
      setFullnameErrorMessage('Full name is required.');
      isValid = false;
    } else {
      setFullnameError(false);
      setFullnameErrorMessage('');
    }
    if (!signupData.username.trim()) {
      setUsernameError(true);
      setUsernameErrorMessage('Username is required.');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }
    if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }
    if (!signupData.password || signupData.password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ open: false, type: 'error', message: '' });

    if (!validate()) return;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (res.ok) {
        setPendingVerification(true);
        setAlert({ open: true, type: 'success', message: data.message || 'Verification code sent. Please check your inbox.' });
        setAlertKey((k) => k + 1);
      } else {
        setAlert({ open: true, type: 'error', message: data.message || 'Signup failed' });
        setAlertKey((k) => k + 1);
      }
    } catch (err) {
      console.log(err);
      setAlert({ open: true, type: 'error', message: 'Signup failed' });
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
        mode={resolvedMode}
      />
      {pendingVerification ? (
        <VerificationCard email={signupData.email} password={signupData.password} />
      ) : (
      <Card variant="outlined">
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Box component="img" src={logo} alt="Taylance CRM Logo" sx={{ width: 40, height: 40, borderRadius: 2, mr: 1, background: '#232946', p: 0.5, boxShadow: 1 }} />
                <Typography variant="h6" sx={{ color: '#4f8cff', fontWeight: 700, letterSpacing: 1, fontFamily: 'Urbanist, sans-serif', fontSize: 26 }}>
                  Taylance CRM
                </Typography>
              </Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Sign up
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <FormLabel htmlFor="fullname">Full Name</FormLabel>
            <TextField
              id="fullname"
              name="fullname"
              value={signupData.fullname}
              onChange={handleChange}
              error={fullnameError}
              helperText={fullnameErrorMessage}
              placeholder="John Doe"
              fullWidth
              variant="outlined"
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
              id="username"
              name="username"
              value={signupData.username}
              onChange={handleChange}
              error={usernameError}
              helperText={usernameErrorMessage}
              placeholder="john123"
              fullWidth
              variant="outlined"
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              id="email"
              name="email"
              type="email"
              value={signupData.email}
              onChange={handleChange}
              error={emailError}
              helperText={emailErrorMessage}
              placeholder="your@email.com"
              fullWidth
              variant="outlined"
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              id="password"
              name="password"
              type="password"
              value={signupData.password}
              onChange={handleChange}
              error={passwordError}
              helperText={passwordErrorMessage}
              placeholder="••••••"
              fullWidth
              variant="outlined"
            />
          </FormControl>

          <Button type="submit" fullWidth variant="contained" color="primary">
            Sign up
          </Button>

          <Typography sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" variant="body2">
              Sign in
            </Link>
          </Typography>
        </Box>

        <Divider>or</Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={() => {
            setAlert({ open: true, type: 'info', message: 'This functionality is currently unavailable.' });
            setAlertKey((k) => k + 1);
          }}>
            Sign up with Google
          </Button>
          <Button fullWidth variant="outlined" startIcon={<FacebookIcon />} onClick={() => {
            setAlert({ open: true, type: 'info', message: 'This functionality is currently unavailable.' });
            setAlertKey((k) => k + 1);
          }}>
            Sign up with Facebook
          </Button>
        </Box>
      </Card>
      )}
    </>
  );
}
