
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/apiClient';

export const fetchAll = createAsyncThunk('manager/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/all', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const exportCSV = createAsyncThunk('manager/exportCSV', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const slice = createSlice({
  name: 'manager',
  initialState: { records: [], loading: false, error: null },
  reducers: { clearError: state => { state.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchAll.fulfilled, (state, { payload }) => { state.records = payload; })
      .addCase(exportCSV.fulfilled, state => { state.loading = false; })
      .addMatcher(a => a.type.endsWith('/pending'), state => { state.loading = true; state.error = null; })
      .addMatcher(a => a.type.endsWith('/rejected'), (state, a) => { state.loading = false; state.error = a.payload; })
      .addMatcher(a => a.type.endsWith('/fulfilled'), state => { state.loading = false; });
  }
});

export const { clearError } = slice.actions;
export default slice.reducer;
