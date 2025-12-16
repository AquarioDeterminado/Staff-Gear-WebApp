import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

export default function Login({ onSubmit }) {

  const navigator = useNavigate();

  const [login, setLogin] = useState({
    email: '',
    password: ''
  });

  const handleChange = (field) => (e) =>
    setLogin((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!login.email || !login.password) {
        throw new Error('Por favor, preencha todos os campos.');
      }
      var resp = await AuthService.login({username: login.email, password: login.password});
      var id = resp.employee_id;
      localStorage.setItem('BusinessID', id);
      navigator('/profile');
    } catch (error) {
      console.error('Erro ao efetuar login:', error.message);
    }    
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pl: { md: 5 }, pt: { xs: 4, md: 10 } }}>
      <Typography
      variant="h4"
      sx={{
      fontSize: 47,
      fontWeight: 800,
      color: '#1f3a56',
      mb: 2.5,
      textAlign: { xs: 'center' },
      }}
      >
  Log In
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          placeholder="Insira o seu Email"
          value={login.email}
          onChange={handleChange('email')}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          placeholder="Insira a sua Password"
          value={login.password}
          onChange={handleChange('password')}
        />
      </Stack>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        endIcon={<LoginIcon />}
        sx={{
          bgcolor: '#000',
          color: '#fff',
          py: 1.25,
          fontWeight: 600,
          borderRadius: 1.5,
          textTransform: 'none',
          '&:hover': { bgcolor: '#222' }
        }}
      >
        Log-In
      </Button>
    </Box>
  );
}
