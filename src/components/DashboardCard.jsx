
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function DashboardCard({ title, value, icon, color }) {
  return (
    <Card sx={{ flex: 1, minWidth: 200, m: 1, borderLeft: `5px solid ${color}` }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ fontSize: 40, color }}>{icon}</Box>
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
