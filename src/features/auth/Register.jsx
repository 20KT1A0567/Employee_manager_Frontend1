import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Box,
  Alert, CircularProgress, Link, Grid, Stepper, Step, StepLabel, Card, CardContent, Divider
} from '@mui/material';
import { PersonAdd, Business, Person, Security } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { register } from './authSlice';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const steps = ['Account Type', 'Basic Information', 'Additional Details'];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee',
    employeeId: '', department: '', companyName: '', position: '', managerCode: ''
  });

  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [localError, setLocalError] = useState('');

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    setLocalError('');
    if (isStepValid()) setActiveStep(prev => prev + 1);
    else setLocalError('Please fill all required fields for this step');
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const onSubmit = async e => {
    e.preventDefault();
    setLocalError('');

    if (form.role === 'employee' && (!form.employeeId || !form.department)) {
      setLocalError('Invalid Credentials: Employee ID and Department are required');
      return;
    }

    if (form.role === 'manager' && (!form.managerCode || !form.companyName || !form.position)) {
      setLocalError('Invalid Credentials: Manager Code, Company Name, and Position are required');
      return;
    }

    const submitData = { ...form };
    if (submitData.role === 'manager') {
      delete submitData.employeeId;
      delete submitData.department;
    }

    const res = await dispatch(register(submitData)).unwrap().catch(console.error);
    if (res) {
      if (res.user.role === 'manager') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0: return form.role;
      case 1: return form.name && form.email && form.password;
      case 2:
        if (form.role === 'manager') return form.companyName && form.position && form.managerCode;
        if (form.role === 'employee') return form.employeeId && form.department;
        return false;
      default: return false;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Select Your Role</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card onClick={() => setForm({ ...form, role: 'employee' })}
                      sx={{ cursor: 'pointer', border: form.role === 'employee' ? '2px solid #1976d2' : '1px solid #e0e0e0', backgroundColor: form.role === 'employee' ? '#f0f7ff' : 'white', transition: 'all 0.3s', '&:hover': { border: '2px solid #1976d2', transform: 'translateY(-2px)' } }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6">Employee</Typography>
                    <Typography variant="body2" color="textSecondary">Track your attendance.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card onClick={() => setForm({ ...form, role: 'manager' })}
                      sx={{ cursor: 'pointer', border: form.role === 'manager' ? '2px solid #1976d2' : '1px solid #e0e0e0', backgroundColor: form.role === 'manager' ? '#f0f7ff' : 'white', transition: 'all 0.3s', '&:hover': { border: '2px solid #1976d2', transform: 'translateY(-2px)' } }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Business sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6">Manager</Typography>
                    <Typography variant="body2" color="textSecondary">Oversee team attendance.</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Basic Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField required fullWidth name="name" label="Full Name" value={form.name} onChange={onChange} /></Grid>
              <Grid item xs={12}><TextField required fullWidth name="email" label="Email" type="email" value={form.email} onChange={onChange} /></Grid>
              <Grid item xs={12}><TextField required fullWidth name="password" label="Password" type="password" value={form.password} onChange={onChange} helperText="Password must be at least 6 characters" /></Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>{form.role === 'manager' ? 'Manager Details' : 'Employee Details'}</Typography>
            <Grid container spacing={2}>
              {form.role === 'manager' ? (
                <>
                  <Grid item xs={12}>
                    <TextField required fullWidth name="managerCode" label="Manager Registration Code" value={form.managerCode} onChange={onChange} InputProps={{ startAdornment: <Security color="action" sx={{ mr: 1 }} /> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}><TextField required fullWidth name="companyName" label="Company Name" value={form.companyName} onChange={onChange} /></Grid>
                  <Grid item xs={12} sm={6}><TextField required fullWidth name="position" label="Your Position" value={form.position} onChange={onChange} helperText="e.g., Team Lead" /></Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6}><TextField required fullWidth name="employeeId" label="Employee ID" value={form.employeeId} onChange={onChange} /></Grid>
                  <Grid item xs={12} sm={6}><TextField required fullWidth name="department" label="Department" value={form.department} onChange={onChange} /></Grid>
                </>
              )}
            </Grid>
          </Box>
        );
      default: return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4, marginBottom: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={8} sx={{ padding: 4, width: '100%', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom fontWeight="bold">Create Account</Typography>
            <Typography variant="body1" color="textSecondary" textAlign="center" gutterBottom>Join the Employee Attendance System</Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
            {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
          </Stepper>

          <Box component="form" onSubmit={onSubmit}>
            {getStepContent(activeStep)}

            {localError && <Alert severity="error" sx={{ mt: 2 }}>{localError}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined">Back</Button>
              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" disabled={loading || !isStepValid()}>{loading ? <CircularProgress size={24} /> : 'Create Account'}</Button>
              ) : (
                <Button onClick={handleNext} variant="contained" disabled={!isStepValid()}>Next</Button>
              )}
            </Box>

            <Box textAlign="center" sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Link component={RouterLink} to="/login" variant="body2">Already have an account? Sign In</Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
