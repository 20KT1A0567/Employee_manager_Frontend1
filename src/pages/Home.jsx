import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  People,
  Schedule,
  Analytics,
  Security,
  ArrowForward,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function Home() {

  const features = [
    {
      icon: <Schedule sx={{ fontSize: 40 }} />,
      title: 'Easy Check-in/out',
      description: 'Simple and intuitive attendance marking system'
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Real-time Analytics',
      description: 'Get instant insights into attendance patterns'
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Team Management',
      description: 'Manage your team attendance efficiently'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your data'
    }
  ];

  return (
    <Box>
      {/* HERO SECTION */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Employee Attendance System
          </Typography>

          <Typography
            variant="h5"
            component="p"
            gutterBottom
            sx={{ opacity: 0.9, mb: 4 }}
          >
            Streamline your workforce management with our modern attendance tracking solution
          </Typography>

          {/* ONLY LOGIN BUTTON */}
          <Button
            component={Link}
            to="/login"
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
              px: 4,
              py: 1.5,
            }}
          >
            Go to Login
          </Button>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Why Choose Our System?
        </Typography>

        <Typography
          variant="h6"
          component="p"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Designed for modern workplaces with powerful features
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid key={index} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  }
                }}
                elevation={4}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>

                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
