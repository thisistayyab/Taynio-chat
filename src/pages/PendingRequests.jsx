import React, { useEffect, useState } from 'react';
import { api } from '../server';
import { Box, Typography, Avatar, Button, CircularProgress, Alert } from '@mui/material';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/v1/api/user/friend-requests`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAccept = async (requestId) => {
    try {
      const res = await fetch(`${api}/v1/api/user/accept-friend-request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        setAlert({ open: true, message: 'Friend request accepted!', severity: 'success' });
        setRequests((prev) => prev.filter(r => r._id !== requestId));
      } else {
        const err = await res.json();
        setAlert({ open: true, message: err.message || 'Failed to accept request', severity: 'error' });
      }
    } catch (err) {
      setAlert({ open: true, message: 'Failed to accept request', severity: 'error' });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await fetch(`${api}/v1/api/user/reject-friend-request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        setAlert({ open: true, message: 'Friend request rejected!', severity: 'info' });
        setRequests((prev) => prev.filter(r => r._id !== requestId));
      } else {
        const err = await res.json();
        setAlert({ open: true, message: err.message || 'Failed to reject request', severity: 'error' });
      }
    } catch (err) {
      setAlert({ open: true, message: 'Failed to reject request', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6, p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>Pending Friend Requests</Typography>
      {alert.open && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}
      {loading ? <CircularProgress /> : (
        requests.length === 0 ? (
          <Typography color="text.secondary">No pending requests.</Typography>
        ) : (
          requests.map(r => (
            <Box key={r._id} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={r.from.profilepic || undefined} />
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{r.from.fullname}</Typography>
                <Typography variant="body2" color="text.secondary">@{r.from.username}</Typography>
              </Box>
              <Button size="small" variant="contained" color="success" onClick={() => handleAccept(r._id)}>Accept</Button>
              <Button size="small" variant="outlined" color="error" onClick={() => handleReject(r._id)}>Reject</Button>
            </Box>
          ))
        )
      )}
    </Box>
  );
} 