
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme/theme';

import Login from './features/auth/Login';
import Register from './features/auth/Register';

import Home from './pages/Home';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import MyAttendance from './features/attendance/MyAttendance';
import Reports from './features/manager/Reports';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/employee/dashboard" element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee/attendance" element={
            <ProtectedRoute role="employee">
              <MyAttendance />
            </ProtectedRoute>
          } />

          <Route path="/manager/dashboard" element={
            <ProtectedRoute role="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/reports" element={
            <ProtectedRoute role="manager">
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          <Route path="*" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>404 - Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;