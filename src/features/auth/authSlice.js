
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/apiClient';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null
};

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user = payload.user;
        s.token = payload.token;
        localStorage.setItem('user', JSON.stringify(payload.user));
        localStorage.setItem('token', payload.token);
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user = payload.user;
        s.token = payload.token;
        localStorage.setItem('user', JSON.stringify(payload.user));
        localStorage.setItem('token', payload.token);
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  }
});

export const { logout, clearError } = slice.actions;
export default slice.reducer;
