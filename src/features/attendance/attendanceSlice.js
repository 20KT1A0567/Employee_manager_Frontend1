
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/apiClient';

const initialState = {
  today: null,
  history: [],
  loading: false,
  error: null
};

export const fetchToday = createAsyncThunk(
  'attendance/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/attendance/today');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const checkIn = createAsyncThunk('attendance/checkIn', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/attendance/checkin');
    return res.data;
  } catch (err) { 
    return rejectWithValue(err.response?.data?.message || err.message)
  }
});

export const checkOut = createAsyncThunk('attendance/checkOut', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/attendance/checkout');
    return res.data;
  } catch (err) { 
    return rejectWithValue(err.response?.data?.message || err.message)
  }
});

export const fetchMyHistory = createAsyncThunk('attendance/myHistory', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/my-history', { params });
    return res.data;
  } catch (err) { 
    return rejectWithValue(err.response?.data?.message || err.message) 
  }
});

const slice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAttendanceState: (state) => {
      state.today = null;
      state.history = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder

      .addCase(fetchToday.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchToday.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.today = payload;
      })
      .addCase(fetchToday.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(checkIn.fulfilled, (s,{payload}) => { 
        s.today = payload; 
      })

      .addCase(checkOut.fulfilled, (s,{payload}) => { 
        s.today = payload; 
      })

      .addCase(fetchMyHistory.fulfilled, (s,{payload}) => { 
        s.history = payload; 
      })

      .addMatcher(action => action.type.endsWith('/pending'), s => { 
        s.loading = true; 
        s.error = null 
      })
      .addMatcher(action => action.type.endsWith('/rejected'), (s, a) => { 
        s.loading = false; 
        s.error = a.payload 
      })
      .addMatcher(action => action.type.endsWith('/fulfilled'), s => { 
        s.loading = false 
      });
  }
});

export const { clearError, resetAttendanceState } = slice.actions;
export default slice.reducer;
