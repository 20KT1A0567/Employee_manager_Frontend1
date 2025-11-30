
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Link,
  Snackbar,
  Alert
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from './authSlice';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openPopup, setOpenPopup] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setOpenPopup(true);
    }
  }, [error]);

  const handleClosePopup = () => {
    setOpenPopup(false);
    dispatch(clearError());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }))
      .unwrap()
      .catch(() => null);

    if (res) {
      if (res.user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    }
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
    if (error) dispatch(clearError());
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
    if (error) dispatch(clearError());
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={8} sx={{ padding: 4, width: '100%', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LoginIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Sign In
            </Typography>
            <Typography color="textSecondary">
              Employee Attendance System
            </Typography>
          </Box>

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              required
              label="Email Address"
              margin="normal"
              value={email}
              onChange={handleEmail}
            />

            <TextField
              fullWidth
              required
              type="password"
              label="Password"
              margin="normal"
              value={password}
              onChange={handlePassword}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>

            <Box textAlign="center" mt={2}>
              <Link component={RouterLink} to="/register">
                Don’t have an account? Register
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={openPopup}
        autoHideDuration={3000}
        onClose={handleClosePopup}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={handleClosePopup}>
          Username or Password is incorrect
        </Alert>
      </Snackbar>

    </Container>
  );
}
