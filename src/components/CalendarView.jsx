
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

export default function CalendarView({ attendanceData = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const startingDay = firstDay.getDay();
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const attendanceMap = {};
  attendanceData.forEach(record => {
    attendanceMap[record.date] = record.status;
  });
  
  const calendarDays = [];
  
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const status = attendanceMap[dateStr];
    calendarDays.push({
      day,
      date: dateStr,
      status
    });
  }
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'present':
      case 'late':
      case 'half-day':
        return { color: '#4caf50', label: 'Present', bgColor: '#e8f5e8' };
      case 'absent':
        return { color: '#f44336', label: 'Absent', bgColor: '#ffebee' };
      default:
        return { color: '#9e9e9e', label: 'No Record', bgColor: '#f5f5f5' };
    }
  };
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const presentDays = attendanceData.filter(record => 
    ['present', 'late', 'half-day'].includes(record.status)
  ).length;
  const absentDays = attendanceData.filter(record => 
    record.status === 'absent'
  ).length;
  const totalWorkDays = new Date(year, month + 1, 0).getDate();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={goToPreviousMonth}>
          <ChevronLeft />
        </IconButton>
        
        <Typography variant="h5" component="h2" fontWeight="bold" textAlign="center">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Typography>
        
        <IconButton onClick={goToNextMonth}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Monthly Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${presentDays} Present`} 
              sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 'bold' }}
            />
            <Chip 
              label={`${absentDays} Absent`} 
              sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 'bold' }}
            />
            <Chip 
              label={`${totalWorkDays - presentDays - absentDays} No Record`} 
              variant="outlined"
            />
            <Chip 
              label={`${Math.round((presentDays / totalWorkDays) * 100)}% Attendance`} 
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      <Box>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {weekdays.map(day => (
            <Grid item xs key={day} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold" color="textSecondary">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={1}>
          {calendarDays.map((dayInfo, index) => (
            <Grid item xs key={index} sx={{ minHeight: 80 }}>
              {dayInfo ? (
                <Card 
                  sx={{ 
                    height: '100%',
                    bgcolor: getStatusInfo(dayInfo.status).bgColor,
                    border: dayInfo.status ? `2px solid ${getStatusInfo(dayInfo.status).color}` : '1px solid #e0e0e0',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 2
                    }
                  }}
                >
                  <CardContent sx={{ p: 1, textAlign: 'center', '&:last-child': { pb: 1 } }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      sx={{ 
                        color: getStatusInfo(dayInfo.status).color,
                        mb: 0.5
                      }}
                    >
                      {dayInfo.day}
                    </Typography>
                    
                    {dayInfo.status && (
                      <Chip
                        label={getStatusInfo(dayInfo.status).label}
                        size="small"
                        sx={{
                          bgcolor: getStatusInfo(dayInfo.status).color,
                          color: 'white',
                          fontSize: '0.6rem',
                          height: 20,
                          minWidth: 50
                        }}
                      />
                    )}
                    
                    {dayInfo.status && attendanceMap[dayInfo.date] && (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" display="block" color="textSecondary">
                          {attendanceData.find(r => r.date === dayInfo.date)?.checkInTime ? 
                            new Date(attendanceData.find(r => r.date === dayInfo.date).checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                          }
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          {attendanceData.find(r => r.date === dayInfo.date)?.checkOutTime ? 
                            new Date(attendanceData.find(r => r.date === dayInfo.date).checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                          }
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ height: '100%', bgcolor: 'grey.50', borderRadius: 1 }} />
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          Legend:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: '50%' }} />
            <Typography variant="body2">Present/Late/Half-day</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: '50%' }} />
            <Typography variant="body2">Absent</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '50%' }} />
            <Typography variant="body2">No Record</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}