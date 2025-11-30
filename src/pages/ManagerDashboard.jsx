
import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography,
  Box, List, ListItem, ListItemText, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell,
  Button, Chip, Stack, Alert, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  TextField, Paper, TableContainer
} from '@mui/material';
import {
  People, CheckCircle, EventBusy, Schedule,
  CalendarToday, Assessment, Download, FilterAlt,
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/apiClient';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import CalendarView from '../components/CalendarView';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ManagerDashboard() {
  const [summary, setSummary] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateDetails, setDateDetails] = useState([]);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [departmentData, setDepartmentData] = useState([]);
  
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);

  const [filter, setFilter] = useState({ 
    from: '', 
    to: '', 
    employeeId: '', 
    status: '' 
  });
  const [filteredRecords, setFilteredRecords] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchMonthlyAttendance();
    fetchEmployees();
    fetchDepartmentData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, todayRes, allRes] = await Promise.all([
        api.get('/attendance/summary'),
        api.get('/attendance/today-status'),
        api.get('/attendance/all?limit=50')
      ]);
      
      setSummary(summaryRes.data);
      setTodayStatus(todayRes.data);
      setRecords(allRes.data);
      setFilteredRecords(allRes.data); 
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const res = await api.get(`/attendance/all?from=${currentMonth}-01&to=${currentMonth}-31`);
      setMonthlyAttendance(res.data);
    } catch (err) {
      console.error('Failed to fetch monthly attendance:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchDepartmentData = async () => {
    try {
      const res = await api.get('/attendance/departments');
      setDepartmentData(res.data);
    } catch (err) {
      console.error('Failed to fetch department data:', err);
    }
  };

  const fetchDateDetails = async (date) => {
    try {
      const res = await api.get(`/attendance/all?date=${date}`);
      setDateDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch date details:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    await fetchDateDetails(date);
    setDateDialogOpen(true);
  };

  const handleFilterChange = (e) => {
    setFilter(prev => ({ 
      ...prev, 
      [e.target.name]: e.target.value 
    }));
  };

  const handleSearch = async () => {
    try {
      const params = {};
      if (filter.employeeId) params.employeeId = filter.employeeId;
      if (filter.from) params.from = filter.from;
      if (filter.to) params.to = filter.to;
      if (filter.status) params.status = filter.status;

      const res = await api.get('/attendance/all', { params });
      setFilteredRecords(res.data || []);
    } catch (err) {
      console.error('Failed to search records:', err);
      alert('Failed to search records');
    }
  };

  const handleClearFilters = () => {
    setFilter({ from: '', to: '', employeeId: '', status: '' });
    setFilteredRecords(records);
  };

  const generateReport = async () => {
    if (!reportStartDate || !reportEndDate) {
      alert('Please select date range');
      return;
    }

    setGeneratingReport(true);
    try {
      let url = `/attendance/all?from=${reportStartDate}&to=${reportEndDate}`;
      if (selectedEmployee !== 'all') {
        url += `&employeeId=${selectedEmployee}`;
      }
      
      const res = await api.get(url);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Employee ID', 'Name', 'Date', 'Status', 'Check In', 'Check Out', 'Total Hours'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        row.userId?.employeeId || '',
        row.userId?.name || '',
        row.date,
        row.status,
        row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString() : '',
        row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString() : '',
        row.totalHours || '0'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${reportStartDate}-to-${reportEndDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const departmentChartData = departmentData.map(dept => ({
    name: dept.department,
    present: dept.present,
    absent: dept.absent,
    attendanceRate: dept.attendanceRate,
    total: dept.total
  }));

  const departmentPieData = departmentData.map(dept => ({
    name: dept.department,
    value: dept.attendanceRate
  }));

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
            Manager Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Overview of team attendance and reports
          </Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: 0 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<Assessment />} label="Overview" iconPosition="start" />
              <Tab icon={<BarChartIcon />} label="Department Analytics" iconPosition="start" />
              <Tab icon={<CalendarToday />} label="Calendar View" iconPosition="start" />
              <Tab icon={<FilterAlt />} label="Reports & Search" iconPosition="start" />
            </Tabs>
          </CardContent>
        </Card>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <DashboardCard
                title="Total Employees"
                value={todayStatus?.totalEmployees || 0}
                icon={<People />}
                color="#1976d2"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DashboardCard
                title="Present Today"
                value={todayStatus?.presentCount || 0}
                icon={<CheckCircle />}
                color="#4caf50"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DashboardCard
                title="Absent Today"
                value={todayStatus?.absentCount || 0}
                icon={<EventBusy />}
                color="#f44336"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DashboardCard
                title="Late Today"
                value={todayStatus?.lateCount || 0}
                icon={<Schedule />}
                color="#ff9800"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} mb={4}>
            {departmentData.slice(0, 4).map((dept, index) => (
              <Grid item xs={12} md={3} key={dept.department}>
                <Card elevation={3} sx={{ 
                  borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                  height: '100%'
                }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {dept.department}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Present:
                      </Typography>
                      <Chip label={dept.present} color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Absent:
                      </Typography>
                      <Chip label={dept.absent} color="error" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Rate:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {dept.attendanceRate}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Team Summary (This Month)
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Present" secondary={summary?.present || 0} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Absent" secondary={summary?.absent || 0} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Late" secondary={summary?.late || 0} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Half-Day" secondary={summary?.halfDay || 0} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Absent Today
                  </Typography>
                  <List>
                    {(!todayStatus?.absentList || todayStatus.absentList.length === 0) ? (
                      <Typography color="textSecondary">No absentee today 🎉</Typography>
                    ) : (
                      todayStatus.absentList.map(emp => (
                        <ListItem key={emp._id}>
                          <ListItemText
                            primary={emp.name}
                            secondary={emp.employeeId}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Late Arrivals Today
                  </Typography>
                  <List>
                    {(!todayStatus?.lateList || todayStatus.lateList.length === 0) ? (
                      <Typography color="textSecondary">No late arrivals 👌</Typography>
                    ) : (
                      todayStatus.lateList.map(emp => (
                        <ListItem key={emp._id}>
                          <ListItemText
                            primary={emp.name}
                            secondary={emp.employeeId}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Card elevation={3} sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Latest Attendance Records
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.slice(0, 10).map(row => (
                    <TableRow key={row._id}>
                      <TableCell>{row.userId?.name}</TableCell>
                      <TableCell>{row.userId?.employeeId}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          size="small" 
                          color={getStatusColor(row.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        {row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>{row.totalHours || '0'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Department-wise Attendance
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="present" name="Present" fill="#4caf50" />
                        <Bar dataKey="absent" name="Absent" fill="#f44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Attendance Rate by Department
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Department Performance Details
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell align="center">Total Employees</TableCell>
                        <TableCell align="center">Present</TableCell>
                        <TableCell align="center">Absent</TableCell>
                        <TableCell align="center">Attendance Rate</TableCell>
                        <TableCell align="center">Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departmentData.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {dept.department}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={dept.total} variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={dept.present} color="success" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={dept.absent} color="error" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Box
                                sx={{
                                  width: '100%',
                                  maxWidth: 100,
                                  height: 8,
                                  backgroundColor: '#f0f0f0',
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                  mr: 1
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${dept.attendanceRate}%`,
                                    height: '100%',
                                    backgroundColor: 
                                      dept.attendanceRate >= 90 ? '#4caf50' :
                                      dept.attendanceRate >= 80 ? '#ff9800' : '#f44336'
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" fontWeight="bold">
                                {dept.attendanceRate}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                dept.attendanceRate >= 90 ? 'Excellent' :
                                dept.attendanceRate >= 80 ? 'Good' :
                                dept.attendanceRate >= 70 ? 'Average' : 'Poor'
                              }
                              color={
                                dept.attendanceRate >= 90 ? 'success' :
                                dept.attendanceRate >= 80 ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <CalendarView 
                attendanceData={monthlyAttendance}
                onDateClick={handleDateClick}
                showEmployeeView={false}
              />
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    This Month's Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Present Days:</Typography>
                      <Chip label={summary?.present || 0} color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Absent Days:</Typography>
                      <Chip label={summary?.absent || 0} color="error" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Late Days:</Typography>
                      <Chip label={summary?.late || 0} color="warning" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Half Days:</Typography>
                      <Chip label={summary?.halfDay || 0} color="primary" size="small" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Search Attendance Records
                  </Typography>
                  <Paper sx={{ p: 2, mt: 2 }}>
                    <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                      <TextField 
                        name="employeeId" 
                        label="Employee ID" 
                        value={filter.employeeId} 
                        onChange={handleFilterChange}
                        size="small"
                      />
                      <TextField 
                        name="from" 
                        label="From" 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        value={filter.from} 
                        onChange={handleFilterChange}
                        size="small"
                      />
                      <TextField 
                        name="to" 
                        label="To" 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        value={filter.to} 
                        onChange={handleFilterChange}
                        size="small"
                      />
                      <TextField 
                        name="status" 
                        select 
                        label="Status" 
                        value={filter.status} 
                        onChange={handleFilterChange} 
                        sx={{ minWidth: 160 }}
                        size="small"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="present">Present</MenuItem>
                        <MenuItem value="late">Late</MenuItem>
                        <MenuItem value="absent">Absent</MenuItem>
                        <MenuItem value="half-day">Half Day</MenuItem>
                      </TextField>
                      <Button variant="contained" onClick={handleSearch} size="small">
                        Search
                      </Button>
                      <Button variant="outlined" onClick={handleClearFilters} size="small">
                        Clear
                      </Button>
                    </Box>
                  </Paper>

                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      Search Results ({filteredRecords.length} records)
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Employee ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Check In</TableCell>
                            <TableCell>Check Out</TableCell>
                            <TableCell>Total Hours</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} align="center">
                                No records found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRecords.map(row => (
                              <TableRow key={row._id}>
                                <TableCell>{row.userId?.name}</TableCell>
                                <TableCell>{row.userId?.employeeId}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={row.status} 
                                    size="small" 
                                    color={getStatusColor(row.status)}
                                  />
                                </TableCell>
                                <TableCell>
                                  {row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString() : '-'}
                                </TableCell>
                                <TableCell>
                                  {row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString() : '-'}
                                </TableCell>
                                <TableCell>{row.totalHours || '0'}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Generate Attendance Report
                  </Typography>
                  
                  <Grid container spacing={3} alignItems="end" sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Employee</InputLabel>
                        <Select
                          value={selectedEmployee}
                          label="Employee"
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                          <MenuItem value="all">All Employees</MenuItem>
                          {employees.map(emp => (
                            <MenuItem key={emp._id} value={emp.employeeId}>
                              {emp.name} ({emp.employeeId})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={generateReport}
                        disabled={generatingReport}
                        startIcon={generatingReport ? <CircularProgress size={20} /> : <FilterAlt />}
                        size="small"
                      >
                        {generatingReport ? 'Generating...' : 'Generate Report'}
                      </Button>
                    </Grid>
                  </Grid>

                  {reportData.length > 0 && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Report Results ({reportData.length} records)
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={exportToCSV}
                          size="small"
                        >
                          Export to CSV
                        </Button>
                      </Box>

                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Employee ID</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Check In</TableCell>
                              <TableCell>Check Out</TableCell>
                              <TableCell>Total Hours</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.map(row => (
                              <TableRow key={row._id}>
                                <TableCell>{row.userId?.employeeId}</TableCell>
                                <TableCell>{row.userId?.name}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={row.status} 
                                    size="small" 
                                    color={getStatusColor(row.status)}
                                  />
                                </TableCell>
                                <TableCell>
                                  {row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString() : '-'}
                                </TableCell>
                                <TableCell>
                                  {row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString() : '-'}
                                </TableCell>
                                <TableCell>{row.totalHours || '0'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>

      <Dialog 
        open={dateDialogOpen} 
        onClose={() => setDateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Attendance Details - {selectedDate}
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dateDetails.map(record => (
                <TableRow key={record._id}>
                  <TableCell>{record.userId?.name}</TableCell>
                  <TableCell>{record.userId?.employeeId}</TableCell>
                  <TableCell>
                    <Chip 
                      label={record.status} 
                      size="small" 
                      color={getStatusColor(record.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                  </TableCell>
                  <TableCell>
                    {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                  </TableCell>
                  <TableCell>{record.totalHours || '0'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDateDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}