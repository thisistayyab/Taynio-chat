import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, TextField, Divider, List, ListItem, ListItemButton, ListItemText, Snackbar, Alert, CircularProgress } from '@mui/material';
import { api } from '../server';

const navItems = [
  'Profile',
  'Password',
  'Stores',
  'Members',
  'Organisation',
  'Integrations',
];

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase();
}

export default function Settings() {
  const [selected, setSelected] = useState('Profile');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Fetch user data on mount
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${api}/v1/api/user/get-user`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
          setEmail(data.data.email);
          setProfilePic(data.data.profilepic || '');
          setFullname(data.data.fullname || '');
          setPhone(data.data.phone || '');
          setAddress(data.data.address || '');
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to fetch user data', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 10 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('fullname', fullname);
      formData.append('phone', phone);
      formData.append('address', address);
      if (profilePic && profilePic !== user.profilepic && profilePic.startsWith('data:')) {
        // Convert base64 to file
        const arr = profilePic.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        for (let i = 0; i < n; ++i) u8arr[i] = bstr.charCodeAt(i);
        const file = new File([u8arr], 'profilepic.png', { type: mime });
        formData.append('profilepic', file);
      }
      const res = await fetch(`${api}/v1/api/user/update-account`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data.data);
        setSnackbar({ open: true, message: 'Account updated successfully', severity: 'success' });
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || 'Update failed', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Box sx={{ width: 220, bgcolor: '#fafbfc', borderRight: '1px solid #eee', p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Settings</Typography>
        <List>
          {navItems.map(item => (
            <ListItem key={item} disablePadding>
              <ListItemButton selected={selected === item} onClick={() => setSelected(item)}>
                <ListItemText primary={item} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Profile</Typography>
        <Typography color="text.secondary" mb={3}>Manage settings for your [Brand_name] profile</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar src={profilePic} sx={{ width: 72, height: 72, fontSize: 32 }}>
            {!profilePic && getInitials(user.fullname)}
          </Avatar>
          <Box>
            <Typography fontWeight={500}>Profile picture</Typography>
            <Typography color="text.secondary" fontSize={14} mb={1}>We support PNGs, JPEGs and GIFs under 10MB</Typography>
            <Button variant="outlined" component="label" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Upload image
              <input type="file" accept="image/png,image/jpeg,image/gif" hidden onChange={handleUpload} />
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Full Name" value={fullname} onChange={e => setFullname(e.target.value)} fullWidth sx={{ flex: 1 }} />
          <TextField label="Mobile Number" value={phone} onChange={e => setPhone(e.target.value)} fullWidth sx={{ flex: 1 }} />
        </Box>
        <TextField label="Address" value={address} onChange={e => setAddress(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
          <TextField label="Email Address" value={email} onChange={e => setEmail(e.target.value)} fullWidth sx={{ flex: 1 }} />
        </Box>
        <Button variant="contained" sx={{ borderRadius: 2, mt: 2, minWidth: 120 }} onClick={handleSave} disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Save'}</Button>
        <Typography color="text.secondary" fontSize={14} mb={3}>You may need to log out and back in to see any change.</Typography>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" color="error" fontWeight={700} mb={1}>Danger zone</Typography>
        <Typography color="text.secondary" fontSize={14} mb={2}>If you want to permanently delete this account and all of its data, you can do so below.</Typography>
        <Button variant="text" color="error" sx={{ textTransform: 'none', fontWeight: 700 }}>Delete account</Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 