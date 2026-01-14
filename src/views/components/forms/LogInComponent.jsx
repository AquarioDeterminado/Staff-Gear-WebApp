/*
Formulário de Login
*/
import { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import logo from '../../../assets/logo.png';
import LoginIcon from '@mui/icons-material/Login';
import AuthService from '../../../services/AuthService';
import { useNavigate } from 'react-router-dom';
import useNotification from '../../../utils/UseNotification';

const ui = {
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#000',
    textAlign: 'center',
    mb: 3,
  },
  button: {
    bgcolor: '#000',
    color: '#fff',
    py: 1.25,
    fontWeight: 600,
    borderRadius: 2,
    textTransform: 'none',
    fontSize: 16,
    '&:hover': { bgcolor: '#FF9800', color: '#000' },
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState({ email: '', password: '' });
  const [feedback, setFeedback] = useState({"email": {"error": ""}, "password": {"error": ""}});
  const [loading, setLoading] = useState(false);
  const notif = useNotification();

  const handleChange = (field) => (e) =>
    setLogin((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({"email": {"error": ""}, "password": {"error": ""}});

    if (!checkInput()) return;

    try {
      setLoading(true);
      await AuthService.login({ Username: login.email, Password: login.password });
      navigate('/profile');
    } catch (error) {
      console.error('Login error:', error);
      notif({severity: 'error', message: error.response.data || 'Login failed. Please try again.'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
      <Box
        component="img"
        src={logo}
        alt="Staff Gear"
        loading="lazy"
        sx={{ height: { xs: 64, md: 120 }, mb: { xs: 2, md: 4 }, objectFit: 'contain' }}
      />

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 420 }}>
        <Typography variant="h4" sx={ui.title}>
          Login
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email"
            placeholder="Insert the Email"
            value={login.email}
            onChange={handleChange('email')}
            sx={{ bgcolor: '#fff', borderRadius: 1 }}
            error={!!feedback.email.error}
            helperText={feedback.email.error}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            placeholder="Insert the Password"
            value={login.password}
            onChange={handleChange('password')}
            sx={{ bgcolor: '#fff', borderRadius: 1 }}
            error={!!feedback.password.error}
            helperText={feedback.password.error}
          />
        </Stack>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          endIcon={<LoginIcon />}
          disabled={loading}
          sx={ui.button}
        >
          {loading ? 'Entering' : 'Enter'}
        </Button>
      </Box>
    </Box>
  );

  function checkInput() {
    var valid = true
    if (!login.email) {
      setFeedback((prev) => ({ ...prev, email: { error: 'Email is required.' } }));
      valid = false;
    }

    if (!login.password) {
      setFeedback((prev) => ({ ...prev, password: { error: 'Password is required.' } }));
      valid = false;
    }

    return valid;
  }
}