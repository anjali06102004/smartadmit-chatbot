import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLead } from '../context/LeadContext';
import { leadService } from '../services/chatService';

const LeadForm = () => {
  const { showLeadForm, setShowLeadForm } = useLead();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: '',
  });

  const steps = [
    'Personal Information',
    'Course Interest',
    'Additional Details',
  ];

  const handleClose = () => {
    setShowLeadForm(false);
    setActiveStep(0);
    setError('');
    setSuccess(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      course: '',
      message: '',
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      await leadService.submitLead(formData);
      setSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit your information. Please try again.');
      console.error('Lead submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.name.trim() && formData.email.trim() && formData.phone.trim();
      case 1:
        return formData.course.trim();
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Course of Interest"
              value={formData.course}
              onChange={handleChange('course')}
              required
              select
              SelectProps={{ native: true }}
              InputProps={{
                startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            >
              <option value="">Select a course</option>
              <option value="Computer Science Engineering">Computer Science Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Master of Business Administration">Master of Business Administration</option>
              <option value="Bachelor of Arts">Bachelor of Arts</option>
              <option value="Bachelor of Computer Applications">Bachelor of Computer Applications</option>
              <option value="Master of Computer Applications">Master of Computer Applications</option>
            </TextField>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Additional Message (Optional)"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange('message')}
              placeholder="Tell us more about your interests or any questions you have..."
            />
          </Box>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <Dialog open={showLeadForm} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Thank You!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your information has been submitted successfully. We'll get back to you soon!
            </Typography>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={showLeadForm} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="h2">
          Get More Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill out this form and we'll get back to you with detailed information about our programs.
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent(activeStep)}
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleBack} disabled={activeStep === 0 || loading}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !isStepValid(activeStep)}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!isStepValid(activeStep)}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LeadForm;
