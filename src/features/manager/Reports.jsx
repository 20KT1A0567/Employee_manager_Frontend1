
import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Grid, Alert, CircularProgress } from '@mui/material';
import { Search, Download } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAll, exportCSV } from './managerSlice';
import Header from '../../components/Header';

export default function Reports() {
  const dispatch = useDispatch();
  const { records, loading, error } = useSelector(state => state.manager);
  const [filter, setFilter] = useState({ from: '', to: '', employeeId: '', status: '' });

  const onChange = e => setFilter({ ...filter, [e.target.name]: e.target.value });
  const handleSearch = () => dispatch(fetchAll(filter));
  const handleExport = () => dispatch(exportCSV(filter));

  const getStatusColor = status => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      case 'half-day': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom fontWeight="bold">Attendance Reports</Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth name="from" label="From Date" type="date" InputLabelProps={{ shrink: true }} value={filter.from} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth name="to" label="To Date" type="date" InputLabelProps={{ shrink: true }} value={filter.to} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth name="employeeId" label="Employee ID" placeholder="EMP001" value={filter.employeeId} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth select name="status" label="Status" value={filter.status} onChange={onChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="late">Late</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="half-day">Half Day</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button fullWidth variant="contained" startIcon={loading ? <CircularProgress size={20} /> : <Search />} onClick={handleSearch} disabled={loading}>Search</Button>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button fullWidth variant="outlined" startIcon={<Download />} onClick={handleExport} disabled={loading}>Export</Button>
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map(record => (
                  <TableRow key={record._id}>
                    <TableCell>{record.userId?.name}</TableCell>
                    <TableCell>{record.userId?.employeeId}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell><Chip label={record.status} color={getStatusColor(record.status)} size="small" /></TableCell>
                    <TableCell>{record.totalHours || '0'} hours</TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}
