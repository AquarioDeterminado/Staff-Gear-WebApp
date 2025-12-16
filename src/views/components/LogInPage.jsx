
import { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import logo from '../../assets/logo.png';
import LoginIcon from '@mui/icons-material/Login';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

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
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) =>
    setLogin((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    try {
      if (!login.email || !login.password) {
        throw new Error('Por favor, preencha todos os campos.');
      }
      setLoading(true);
      await AuthService.logIn(login.email, login.password);
      navigate('/profile');
    } catch (error) {
      const msg =
        (error?.response?.data &&
          (typeof error.response.data === 'string'
            ? error.response.data
            : error.response.data.detail ||
            error.response.data.title ||
            error.response.data.message)) ||
        error?.message ||
        'Erro ao efetuar login.';
      setFeedback({ type: 'error', text: msg });
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

        {feedback && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {feedback.text}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            placeholder="Insira o seu Email"
            value={login.email}
            onChange={handleChange('email')}
            sx={{ bgcolor: '#fff', borderRadius: 1 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            placeholder="Insira a sua Password"
            value={login.password}
            onChange={handleChange('password')}
            sx={{ bgcolor: '#fff', borderRadius: 1 }}
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
          {loading ? 'A entrar...' : 'Entrar'}
        </Button>
      </Box>
    </Box>
  );
}