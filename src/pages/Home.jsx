import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { api } from '../server';
import { useNavigate } from 'react-router-dom';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorModeSelect from '../themes/ColorModeSelect';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import { io as socketIO } from 'socket.io-client';
import MuiAlert from '@mui/material/Alert';

const minSidebarWidth = 220;
const maxSidebarWidth = 400;

const Resizer = styled('div')(({ theme }) => ({
  width: 6,
  cursor: 'col-resize',
  background: theme.palette.action.hover,
  zIndex: 100,
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  transition: 'background 0.2s',
  '&:hover': {
    background: theme.palette.action.selected,
  },
}));

// Date formatting utilities
function formatSidebarTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}
function formatChatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatChatDateSeparator(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return 'Today';
  } else if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

// Placeholder for profile info in right sidebar
function ProfileInfo() {
  return (
    <Box sx={{ p: 2 }}>
      <Avatar sx={{ width: 80, height: 80, mb: 2 }} />
      <Typography fontWeight={600} fontSize={20}>Ram Kumar</Typography>
      <Typography color="text.secondary" fontSize={15}>@ramkumar</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography fontSize={14} color="text.secondary">Email: ramkumar@email.com</Typography>
      <Typography fontSize={14} color="text.secondary">Phone: +91 12345 67890</Typography>
      <Typography fontSize={14} color="text.secondary">Status: Online</Typography>
    </Box>
  );
}

export default function Home() {
  const theme = useTheme();
  const [leftWidth, setLeftWidth] = React.useState(260);
  const [resizing, setResizing] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const searchTimeout = React.useRef();
  const [notifAnchorEl, setNotifAnchorEl] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = React.useState(0);
  const [socket, setSocket] = React.useState(null);
  const [friendRequests, setFriendRequests] = React.useState([]);
  const [addFriendAlert, setAddFriendAlert] = React.useState({ open: false, message: '', severity: 'success' });
  const [friends, setFriends] = React.useState([]);
  const [activeFriend, setActiveFriend] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [messageLoading, setMessageLoading] = React.useState(false);
  const [messageError, setMessageError] = React.useState('');
  const [rightOpen, setRightOpen] = React.useState(false);
  const [rightProfile, setRightProfile] = React.useState(null);
  const [friendsWithPreview, setFriendsWithPreview] = React.useState([]);
  const [unreadCounts, setUnreadCounts] = React.useState({});
  const messagesEndRef = React.useRef(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${api}/v1/api/user/get-user`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
        }
      } catch (err) {
        console.log(err)
      }
    };
    fetchUser();
  }, []);

  React.useEffect(() => {
    if (!user) return;
    // Connect to socket.io server
    const s = socketIO(`${api}`, {
      withCredentials: true,
      transports: ['websocket'],
    });
    setSocket(s);
    // Join room with user ID for direct notifications
    s.emit('join', { userId: user._id });
    // Listen for friend request events
    s.on('friendRequest', (data) => {
      console.log('Received friendRequest event:', data);
      setNotifications((prev) => [
        { id: Date.now(), text: 'You have a new friend request!', type: 'friendRequest', from: data.from },
        ...prev,
      ]);
      // Optionally, fetch latest friend requests
      fetchFriendRequests();
    });
    s.on('friendRequestAccepted', (data) => {
      setNotifications((prev) => [
        { id: Date.now(), text: 'Your friend request was accepted!', type: 'friendRequestAccepted', by: data.by },
        ...prev,
      ]);
    });
    return () => {
      s.disconnect();
    };
  }, [user]);

  const fetchFriendRequests = async () => {
    try {
      const res = await fetch(`${api}/v1/api/user/friend-requests`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFriendRequests(data.data);
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    if (addDialogOpen) fetchFriendRequests();
  }, [addDialogOpen]);

  const handleSendFriendRequest = async (to) => {
    try {
      const res = await fetch(`${api}/v1/api/user/send-friend-request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      });
      if (res.ok) {
        setAddFriendAlert({ open: true, message: 'Friend request sent!', severity: 'success' });
      } else {
        const err = await res.json();
        setAddFriendAlert({ open: true, message: err.message || 'Failed to send request', severity: 'error' });
      }
    } catch (err) {
      setAddFriendAlert({ open: true, message: 'Failed to send request', severity: 'error' });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`${api}/v1/api/user/accept-friend-request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Friend request accepted!', severity: 'success' });
        setFriendRequests((prev) => prev.filter(r => r._id !== requestId));
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || 'Failed to accept request', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to accept request', severity: 'error' });
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch(`${api}/v1/api/user/reject-friend-request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Friend request rejected!', severity: 'info' });
        setFriendRequests((prev) => prev.filter(r => r._id !== requestId));
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || 'Failed to reject request', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to reject request', severity: 'error' });
    }
  };

  // Fetch friends and their last message preview
  const fetchFriends = async () => {
    try {
      const res = await fetch(`${api}/v1/api/user/friends`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // For each friend, fetch their last message
        const friends = data.data;
        const previews = await Promise.all(friends.map(async (f) => {
          try {
            const msgRes = await fetch(`${api}/v1/api/user/messages/last/${f._id}`, {
              method: 'GET',
              credentials: 'include',
            });
            if (msgRes.ok) {
              const msgData = await msgRes.json();
              return { ...f, lastMsg: msgData.data?.text || '', lastMsgTime: msgData.data?.time || '' };
            }
          } catch {}
          return { ...f, lastMsg: '', lastMsgTime: '' };
        }));
        setFriendsWithPreview(previews);
      }
    } catch (err) {}
  };
  React.useEffect(() => {
    if (user) fetchFriends();
  }, [user]);

  // Fetch messages with active friend
  React.useEffect(() => {
    if (!activeFriend) { setMessages([]); return; }
    const fetchMessages = async () => {
      setMessageLoading(true);
      try {
        const res = await fetch(`${api}/v1/api/user/messages/${activeFriend._id}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.data || []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        setMessages([]);
      }
      setMessageLoading(false);
    };
    fetchMessages();
  }, [activeFriend]);

  // Add socket message sending/receiving logic
  React.useEffect(() => {
    if (!socket) return;
    socket.on('message', (msg) => {
      if (activeFriend && msg.from === activeFriend._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setSnackbar({ open: true, message: `New message from ${msg.fromName || 'a friend'}`, severity: 'info' });
        setNotifications(prev => [
          { id: Date.now(), text: `New message from ${msg.fromName || 'a friend'}`, type: 'message', from: msg.from, time: msg.time },
          ...prev,
        ]);
        // Desktop notification
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('New message', {
            body: msg.text,
            icon: '/favicon.ico', // or your app logo
          });
        }
      }
    });
    return () => {
      socket.off('message');
    };
  }, [socket, activeFriend]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeFriend) return;
    setMessageError('');
    setNewMessage('');
    try {
      const res = await fetch(`${api}/v1/api/user/messages/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: activeFriend._id, text: newMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.data]);
      }
    } catch {}
  };

  // Handle resizing left sidebar
  const handleMouseDown = (e) => {
    setResizing(true);
  };
  React.useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e) => {
      setLeftWidth((prev) => {
        let newWidth = e.clientX;
        if (newWidth < minSidebarWidth) newWidth = minSidebarWidth;
        if (newWidth > maxSidebarWidth) newWidth = maxSidebarWidth;
        return newWidth;
      });
    };
    const handleMouseUp = () => setResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // Handle right sidebar open/close
  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);
  const openProfile = Boolean(profileAnchorEl);

  const handleAddFriendOpen = () => setAddDialogOpen(true);
  const handleAddFriendClose = () => { setAddDialogOpen(false); setSearch(''); setSearchResults([]); setAddFriendAlert({ open: false, message: '', severity: 'success' }); };

  const handleSearchInput = (e) => {
    setSearch(e.target.value);
    setAddFriendAlert({ open: false, message: '', severity: 'success' });
  };

  React.useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (search.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${api}/v1/api/user/search-users?q=${encodeURIComponent(search)}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.data);
        }
      } catch (err) {}
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const handleAddFriend = async (friendId) => {
    try {
      const res = await fetch(`${api}/v1/api/user/add-friend`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Friend added!', severity: 'success' });
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || 'Failed to add friend', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add friend', severity: 'error' });
    }
  };

  // When a friend is clicked, clear unread message notifications for that friend
  const handleFriendClick = async (f) => {
    setActiveFriend(f);
    setUnreadCounts(prev => ({ ...prev, [f._id]: 0 }));
    // Remove unread message notifications for this friend
    setNotifications(prev => prev.filter(n => !(n.type === 'message' && n.from === f._id)));
    // Reset unread count in backend
    try {
      await fetch(`${api}/v1/api/user/reset-unread`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: f._id }),
      });
      // Fetch latest unreadCounts from backend after reset
      const res = await fetch(`${api}/v1/api/user/unread-counts`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCounts(data.data || {});
        localStorage.setItem('unreadCounts', JSON.stringify(data.data || {}));
      }
    } catch {}
  };

  // Initialize unreadCounts from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('unreadCounts');
    if (stored) setUnreadCounts(JSON.parse(stored));
  }, []);

  // Update localStorage whenever unreadCounts changes
  React.useEffect(() => {
    localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  // On mount, fetch unreadCounts from backend and update state/localStorage
  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${api}/v1/api/user/unread-counts`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCounts(data.data || {});
          localStorage.setItem('unreadCounts', JSON.stringify(data.data || {}));
        }
      } catch {}
    };
    fetchUnread();
  }, []);

  // Request browser notification permission on mount
  React.useEffect(() => {
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, activeFriend]);

  React.useEffect(() => {
    // Count unread notifications (all types)
    setUnreadNotifCount(notifications.length);
  }, [notifications]);

  // When notification dropdown is opened, mark all as read
  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
    setUnreadNotifCount(0);
  };

  return (
    <>
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <Box
        sx={{
          width: leftWidth,
          minWidth: minSidebarWidth,
          maxWidth: maxSidebarWidth,
          position: 'relative',
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Profile section */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', position: 'relative' }}>
          <Avatar src={user?.profilepic || undefined} onClick={handleProfileClick} sx={{ cursor: 'pointer' }} />
          <Box onClick={handleProfileClick} sx={{ flex: 1, cursor: 'pointer' }}>
            <Typography fontWeight={600}>{user?.fullname || '...'}</Typography>
            <Typography variant="body2" color="text.secondary">@{user?.username || ''}</Typography>
          </Box>
          <IconButton size="small" onClick={e => { e.stopPropagation(); handleNotifClick(e); }} sx={{ ml: 1 }}>
            <Badge color="error" badgeContent={unreadNotifCount} max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={() => setNotifAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { minWidth: 260, p: 1 } }}
          >
            <Typography fontWeight={700} sx={{ px: 2, pt: 1, pb: 1 }}>Notifications</Typography>
            {notifications.length === 0 ? (
              <Typography color="text.secondary" sx={{ px: 2, py: 1 }}>No notifications</Typography>
            ) : (
              notifications.map(n => (
                <Box
                  key={n.id}
                  sx={{ px: 2, py: 1, borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' }, cursor: n.type === 'message' ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (n.type === 'message') {
                      const friend = friendsWithPreview.find(f => f._id === n.from);
                      if (friend) {
                        setActiveFriend(friend);
                        setNotifAnchorEl(null); // close dropdown
                      }
                    }
                  }}
                >
                  <Typography fontSize={14}>
                    {n.type === 'message'
                      ? `${(friendsWithPreview.find(f => f._id === n.from)?.fullname || 'A friend')} sent you a message`
                      : 'You have a new friend request!'}
                  </Typography>
                  {n.time && <Typography fontSize={11} color="text.secondary">{formatSidebarTime(n.time)}</Typography>}
                </Box>
              ))
            )}
            {friendRequests.length > 0 && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography fontWeight={600} fontSize={15} sx={{ mb: 1 }}>Friend Requests</Typography>
                {friendRequests.map(r => (
                  <Box key={r._id} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={r.from.profilepic || undefined} sx={{ width: 32, height: 32 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>{r.from.fullname}</Typography>
                      <Typography variant="body2" color="text.secondary">@{r.from.username}</Typography>
                    </Box>
                    <Button size="small" variant="contained" color="success" onClick={() => handleAcceptRequest(r._id)}>Accept</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleRejectRequest(r._id)}>Reject</Button>
                  </Box>
                ))}
              </Box>
            )}
          </Popover>
        </Box>
        <Popover
          open={openProfile}
          anchorEl={profileAnchorEl}
          onClose={handleProfileClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { minWidth: 260, p: 2 } }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Avatar src={user?.profilepic || undefined} sx={{ width: 56, height: 56, mb: 1, mx: 'auto' }} />
            <Typography fontWeight={700} align="center">{user?.fullname}</Typography>
            <Typography variant="body2" color="text.secondary" align="center">@{user?.username}</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Email" secondary={user?.email} />
              </ListItem>
              {/* Add more user info here if needed */}
            </List>
            <Box sx={{ mt: 2, mb: 1 }}>
              <ColorModeSelect fullWidth sx={{ width: '100%' }} />
            </Box>
            <MenuItem onClick={() => { handleProfileClose(); navigate('/settings'); }}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            <MenuItem onClick={() => { handleProfileClose(); navigate('/pending-requests'); }}>
              <ListItemIcon><NotificationsIcon /></ListItemIcon>
              <ListItemText primary="Friend Requests" />
            </MenuItem>
          </Box>
        </Popover>
        {/* In the sidebar, only render the friends list and search bar: */}
        <Box sx={{ px: 2, pt: 1, pb: 1, flex: 1, overflow: 'auto' }}>
          <TextField
            placeholder="Search friends..."
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            // Add search logic if needed
          />
          <Typography fontWeight={600} fontSize={15} sx={{ mb: 1 }}>Friends</Typography>
          {friendsWithPreview.length === 0 ? (
            <Typography color="text.secondary" fontSize={14}>No friends yet.</Typography>
          ) : (
            friendsWithPreview.map(f => (
              <Box key={f._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, cursor: 'pointer', bgcolor: activeFriend?._id === f._id ? 'primary.light' : 'transparent', borderRadius: 1, p: 1 }} onClick={() => handleFriendClick(f)}>
                <Badge badgeContent={unreadCounts[f._id] || 0} color="error">
                  <Avatar src={f.profilepic || undefined} sx={{ width: 32, height: 32 }} />
                </Badge>
                <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <Typography fontWeight={600} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.fullname}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{f.lastMsg}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                  <Typography fontSize={12} color="text.secondary">
                    {f.lastMsgTime ? formatSidebarTime(f.lastMsgTime) : ''}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
        <Divider />
        {/* Chat list placeholder */}
        <Box sx={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20 }}>
          <IconButton color="primary" sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }} onClick={handleAddFriendOpen} size="large">
            <AddIcon />
          </IconButton>
        </Box>
        <Dialog open={addDialogOpen} onClose={handleAddFriendClose} maxWidth="xs" fullWidth>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogContent>
            {addFriendAlert.open && (
              <MuiAlert severity={addFriendAlert.severity} sx={{ mb: 2 }}>{addFriendAlert.message}</MuiAlert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Search by username or email"
              type="text"
              fullWidth
              value={search}
              onChange={handleSearchInput}
              // do not disable input while searching
            />
            {searchLoading && <CircularProgress size={24} sx={{ mt: 2 }} />}
            {searchResults.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {searchResults.map(u => (
                  <Box key={u._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar src={u.profilepic || undefined} />
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>{u.fullname}</Typography>
                      <Typography variant="body2" color="text.secondary">@{u.username} &bull; {u.email}</Typography>
                    </Box>
                    <Button variant="contained" size="small" onClick={() => handleSendFriendRequest(u._id)}>Add</Button>
                  </Box>
                ))}
              </Box>
            )}
            {!searchLoading && search && searchResults.length === 0 && (
              <Typography color="text.secondary" sx={{ mt: 2 }}>No users found.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddFriendClose}>Close</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Resizer onMouseDown={handleMouseDown} />
      </Box>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chat Header */}
        {activeFriend && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', zIndex: 1, bgcolor: '#f8fbff', borderTopRightRadius: 18, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)', px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 72 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => { setRightProfile(activeFriend); setRightOpen(true); }}>
              <Avatar src={activeFriend.profilepic || undefined} />
              <Box>
                <Typography fontWeight={600}>{activeFriend.fullname}</Typography>
                <Typography variant="body2" color="text.secondary">@{activeFriend.username}</Typography>
              </Box>
            </Box>
          </Box>
        )}
        {/* Chat Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
          {messageLoading ? (
            <CircularProgress />
          ) : (
            messages.length === 0 ? (
              <Typography color="text.secondary">No messages yet.</Typography>
            ) : (
              (() => {
                let lastDate = null;
                return messages.map((msg, i) => {
                  const msgDate = new Date(msg.time).toDateString();
                  const showDateSeparator = msgDate !== lastDate;
                  lastDate = msgDate;
                  return (
                    <React.Fragment key={i}>
                      {showDateSeparator && (
                        <Box sx={{ textAlign: 'center', my: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatChatDateSeparator(msg.time)}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: msg.from === user._id ? 'flex-end' : 'flex-start', mb: 2 }}>
                        <Box sx={{ maxWidth: 340, bgcolor: msg.from === user._id ? '#1976d2' : '#f5f5f5', color: msg.from === user._id ? '#fff' : 'text.primary', borderRadius: 3, p: 1.5, boxShadow: 1, position: 'relative' }}>
                          <Typography fontSize={15}>{msg.text}</Typography>
                          <Typography fontSize={11} sx={{ position: 'absolute', right: 8, bottom: -18, color: msg.from === user._id ? '#fff' : 'text.secondary' }}>{formatChatTime(msg.time)}</Typography>
                        </Box>
                      </Box>
                    </React.Fragment>
                  );
                });
              })()
            )
          )}
          <div ref={messagesEndRef} />
        </Box>
        {/* Chat Input at the bottom */}
        {activeFriend && (
          <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff' }}>
            <TextField
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              fullWidth
              size="small"
              onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
            />
            <Button variant="contained" onClick={handleSendMessage} disabled={!newMessage.trim() || messageLoading}>Send</Button>
            {messageError && <Typography color="error" fontSize={13}>{messageError}</Typography>}
          </Box>
        )}
      </Box>

      {/* Right Sidebar (Profile/Details) */}
      <Drawer
        anchor="right"
        open={rightOpen}
        onClose={() => setRightOpen(false)}
        variant="temporary"
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        {rightProfile && (
          <Box sx={{ p: 3 }}>
            <Avatar src={rightProfile.profilepic || undefined} sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography fontWeight={600} fontSize={20}>{rightProfile.fullname}</Typography>
            <Typography color="text.secondary" fontSize={15}>@{rightProfile.username}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography fontSize={14} color="text.secondary">Email: {rightProfile.email}</Typography>
            {rightProfile.phone && <Typography fontSize={14} color="text.secondary">Phone: {rightProfile.phone}</Typography>}
            {rightProfile.address && <Typography fontSize={14} color="text.secondary">Address: {rightProfile.address}</Typography>}
            <Typography fontSize={14} color="text.secondary">Status: Online</Typography>
          </Box>
        )}
      </Drawer>
    </Box>
        </>
  );
}

