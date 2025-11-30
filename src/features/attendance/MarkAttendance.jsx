
import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Login as CheckInIcon, Logout as CheckOutIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, fetchToday } from './attendanceSlice';

export default function MarkAttendance() {
  const dispatch = useDispatch();
  const { today, loading, error } = useSelector(s => s.attendance);

  
  useEffect(() => {
    dispatch(fetchToday());
  }, [dispatch]);

  const checkedIn = !!today?.checkInTime;
  const checkedOut = !!today?.checkOutTime;

  const onCheckIn = () => dispatch(checkIn());
  const onCheckOut = () => dispatch(checkOut());

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Mark Attendance
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6">Today's Status</Typography>
            <Chip
              label={checkedIn ? 'Checked In' : 'Not Checked In'}
              color={checkedIn ? 'success' : 'default'}
              variant="outlined"
            />
            {today?.status && (
              <Chip
                label={today.status}
                color={getStatusColor(today.status)}
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={onCheckIn}
              startIcon={loading ? <CircularProgress size={18} /> : <CheckInIcon />}
              disabled={loading || checkedIn}
              sx={{ flex: 1 }}
            >
              Check In
            </Button>

            <Button
              variant="outlined"
              onClick={onCheckOut}
              startIcon={loading ? <CircularProgress size={18} /> : <CheckOutIcon />}
              disabled={loading || !checkedIn || checkedOut}
              sx={{ flex: 1 }}
            >
              Check Out
            </Button>
          </Stack>

          {today && (
            <Box>
              <Typography variant="h6">Today's Record</Typography>
              <Stack>
                <Typography>Check In: {today.checkInTime ? new Date(today.checkInTime).toLocaleString() : '--'}</Typography>
                <Typography>Check Out: {today.checkOutTime ? new Date(today.checkOutTime).toLocaleString() : '--'}</Typography>
                {today.totalHours && <Typography>Total Hours: {today.totalHours}h</Typography>}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
