
import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { 
  CalendarToday, 
  Dashboard, 
  CheckCircle, 
  Cancel, 
  Warning,
  AccessTime,
  Schedule
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/apiClient';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import MarkAttendance from '../features/attendance/MarkAttendance';
import CalendarView from '../components/CalendarView';
import { fetchMyHistory } from '../features/attendance/attendanceSlice';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EmployeeDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  
  const dispatch = useDispatch();
  const { history } = useSelector(state => state.attendance);

  useEffect(() => {
    fetchDashboardData();
    fetchMonthlyAttendance();
    dispatch(fetchMyHistory({ limit: 7 }));
  }, [dispatch]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/employee');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const res = await api.get(`/attendance/my-history?from=${currentMonth}-01&to=${currentMonth}-31`);
      setMonthlyAttendance(res.data);
    } catch (err) {
      console.error('Failed to fetch monthly attendance:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      case 'half-day': return 'Half Day';
      case 'checked-in': return 'Checked In';
      case 'checked-out': return 'Checked Out';
      default: return 'Not Checked In';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
      case 'checked-in':
        return <CheckCircle />;
      case 'absent':
        return <Cancel />;
      case 'late':
      case 'half-day':
        return <Warning />;
      default:
        return <Schedule />;
    }
  };

  const getCardColor = (status) => {
    switch (status) {
      case 'present':
      case 'checked-in':
        return '#4caf50';
      case 'absent':
        return '#f44336';
      case 'late':
      case 'half-day':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'half-day': return 'primary';
      default: return 'default';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
       
        <Box mb={4}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Employee Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome back! Here's your attendance overview.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: 0 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                icon={<Dashboard />} 
                label="Overview" 
                iconPosition="start"
              />
              <Tab 
                icon={<CalendarToday />} 
                label="Monthly Calendar" 
                iconPosition="start"
              />
            </Tabs>
          </CardContent>
        </Card>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <DashboardCard
                title="Today's Status"
                value={getStatusDisplay(dashboardData?.todayStatus)}
                icon={getStatusIcon(dashboardData?.todayStatus)}
                color={getCardColor(dashboardData?.todayStatus)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DashboardCard
                title="Present Days"
                value={dashboardData?.present || 0}
                icon={<CheckCircle />}
                color="#4caf50"
                subtitle="This month"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DashboardCard
                title="Absent Days"
                value={dashboardData?.absent || 0}
                icon={<Cancel />}
                color="#f44336"
                subtitle="This month"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DashboardCard
                title="Late Days"
                value={dashboardData?.late || 0}
                icon={<Warning />}
                color="#ff9800"
                subtitle="This month"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DashboardCard
                title="Total Hours Worked"
                value={`${dashboardData?.totalHours || 0}h`}
                icon={<AccessTime />}
                color="#2196f3"
                subtitle="This month"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DashboardCard
                title="Attendance Rate"
                value={`${Math.round(((dashboardData?.present || 0) / ((dashboardData?.present || 0) + (dashboardData?.absent || 0) + (dashboardData?.late || 0))) * 100) || 0}%`}
                icon={<CheckCircle />}
                color="#4caf50"
                subtitle="This month"
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Quick Check In/Out
                  </Typography>
                  <MarkAttendance />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Recent Attendance (Last 7 Days)
                  </Typography>
                  <List dense>
                    {history?.slice(0, 7).map((record, index) => (
                      <React.Fragment key={record.id}>
                        <ListItem>
                          <ListItemIcon>
                            {getStatusIcon(record.status)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1">
                                  {new Date(record.date).toLocaleDateString()}
                                </Typography>
                                <Chip 
                                  label={getStatusDisplay(record.status)} 
                                  size="small" 
                                  color={getStatusColor(record.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box display="flex" gap={2} mt={0.5}>
                                <Typography variant="caption" color="textSecondary">
                                  Check In: {formatTime(record.checkInTime)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Check Out: {formatTime(record.checkOutTime)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < history.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                    {(!history || history.length === 0) && (
                      <ListItem>
                        <ListItemText 
                          primary="No attendance records found" 
                          sx={{ textAlign: 'center', color: 'text.secondary' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <CalendarView attendanceData={monthlyAttendance} />
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Card elevation={3} sx={{ height: 'fit-content' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    This Month's Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Present Days:</Typography>
                      <Chip label={dashboardData?.present || 0} color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Absent Days:</Typography>
                      <Chip label={dashboardData?.absent || 0} color="error" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Late Days:</Typography>
                      <Chip label={dashboardData?.late || 0} color="warning" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Total Hours:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {dashboardData?.totalHours || 0}h
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Attendance Rate:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {Math.round(((dashboardData?.present || 0) / ((dashboardData?.present || 0) + (dashboardData?.absent || 0) + (dashboardData?.late || 0))) * 100) || 0}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    </>
  );
}