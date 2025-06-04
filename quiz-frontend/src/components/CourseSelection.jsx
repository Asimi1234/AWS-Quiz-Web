import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent,
  CardActions, Button, Box, CircularProgress
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const courses = [
  {
    id: 'GST112',
    name: 'Nigerian Peoples and Culture',
    questions: 25,
    duration: '5 min'
  },
  {
    id: 'GET102',
    name: 'Engineering Graphics and Solid Modelling I',
    questions: 25,
    duration: '5 min'
  },
  {
    id: 'CHM102',
    name: 'General Chemistry II',
    questions: 25,
    duration: '5 min'
  }
];

const CourseSelection = () => {
  const navigate = useNavigate();
  const [loadingCourse, setLoadingCourse] = useState(null);

  const handleSelectCourse = (courseId) => {
    setLoadingCourse(courseId);
    setTimeout(() => {
      navigate(`/quiz/${courseId}`);
    }, 1500); // Simulate loading delay (1.5 seconds)
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
        color: 'white',
      }}
    >
      {/* Header */}
      <Container sx={{ py: 7 }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={8}>
          <Box
            component="img"
            src="https://res.cloudinary.com/dlytakuhd/image/upload/v1748332310/logo_z5esiq.png"
            alt="Company Logo"
            sx={{ height: 50, width: 50, mr: 2 }}
          />
          <Typography variant="h5" fontWeight="bold">
            IzyQuiz Lite
          </Typography>
        </Box>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 5 }}
        >
          Select a Course to Start Quiz
        </Typography>
      </Container>

      {/* Main content */}
      <Container sx={{ flex: '1' }}>
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 7 }}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  width: 300,
                  borderRadius: 3,
                  backgroundColor: '#ffffffdd',
                  color: '#000',
                  position: 'relative',
                  transition: 'transform 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SchoolIcon sx={{ fontSize: 30, mr: 1, color: '#0f4c75' }} />
                    <Typography variant="h6" fontWeight="bold">
                      {course.id}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {course.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Questions:</strong> {course.questions}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Duration:</strong> {course.duration}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ backgroundColor: '#0f4c75' }}
                    onClick={() => handleSelectCourse(course.id)}
                    disabled={!!loadingCourse}
                  >
                    {loadingCourse === course.id ? 'Loading...' : 'Start Quiz'}
                  </Button>
                </CardActions>

                {/* Inline spinner if this card is loading */}
                {loadingCourse === course.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.8)',
                      borderRadius: 3,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          color: '#ccc',
          backgroundColor: '#0f2027',
          opacity: 0.5,
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Asimi Israel Ayomikun. All rights reserved.
        </Typography>
      </Box>

    </Box>
  );
};

export default CourseSelection;