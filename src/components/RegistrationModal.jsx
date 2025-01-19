import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Container,
  Divider,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Autocomplete
} from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { blue, grey } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Constants for dropdown menus
const QUALIFYING_EXAMS = ['HS'];
const BOARDS = ['WBCHSE'];
const RELIGIONS = ['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 'JAIN', 'OTHER'];
const CASTES = [ 'SC', 'ST'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const INSTITUTIONS = [
  'University of Calcutta',
  'Jadavpur University',
  'Rabindra Bharati University',
  'Presidency University',
  'West Bengal State University',
  'University of Kalyani',
  'Vidyasagar University',
  'University of Burdwan',
  'Bankura University',
  'Sidho Kanho Birsha University',
  'Kazi Nazrul University',
  'Maulana Abul Kalam Azad University of Technology',
  'Murshidabad University',
  'Netaji Subhas Open University',
  'University of North Bengal',
  'Raiganj University',
  'Rani Rashmoni Green University',
  'Sadhu Ram Chand Murmu University',
  'The Sanskrit College and University',
  'Uttar Banga Krishi Viswavidyalaya',
  'West Bengal University of Animal and Fishery Sciences',
  'West Bengal University of Health Sciences',
  'Diamond Harbour Women\'s University',
  'Cooch Behar Panchanan Barma University',
  'Aliah University',
  'Alipurduar University',
  'Biswa Bangla Biswabidyalay',
  'Dakshin Dinajpur University',
  'Darjeeling Hills University',
  'Harichand Guruchand University',
  'Hindi University',
  'Kanyashree University',
  'Mahatma Gandhi University',
  'West Bengal University of Teachers\' Training, Education Planning and Administration',
  'Visva-Bharati University'
].sort(); // Sort alphabetically

const RegistrationModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    aadharName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    gender: '',
    religion: '',
    caste: '',
    qualifyingExam: '',
    board: '',
    rollNo: '',
    year: '',
    totalMarks: '',
    marksObtained: '',
    percentage: '',
    institution: '',
    courseName: '',
    courseDuration: '',
    securityCode: '',
    dateOfBirth: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [displaySecurityCode, setDisplaySecurityCode] = useState('');
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(true);
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityCodeError, setSecurityCodeError] = useState('');

  // Generate random 5-digit security code
  const generateSecurityCode = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setDisplaySecurityCode(code);
    setFormData(prev => ({ ...prev, securityCode: '' }));
  };

  // Reset states when modal opens
  useEffect(() => {
    if (open) {
      setShowInstructionsDialog(true);
      setInstructionsAccepted(false);
      generateSecurityCode();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear errors
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    if (name === 'securityCode') {
      setSecurityCodeError('');
    }

    // Convert to uppercase for specific fields
    const formattedValue = (name !== 'email' && name !== 'password' && name !== 'dateOfBirth') 
      ? value.toUpperCase() 
      : value;

    if (name === 'securityCode') {
      // Only allow numbers
      if (/^\d*$/.test(value) && value.length <= 5) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (name === 'marksObtained' || name === 'totalMarks') {
      const marks = parseFloat(formattedValue) || 0;
      const total = name === 'totalMarks' ? marks : parseFloat(formData.totalMarks) || 0;
      const obtained = name === 'marksObtained' ? marks : parseFloat(formData.marksObtained) || 0;
      const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : '0';

      // Add percentage validation
      if (percentage < 60) {
        setError('Minimum 60% is required to apply for the scholarship');
      } else {
        setError('');
      }

      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
        percentage: percentage
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of Birth is required';
    }
    
    if (!formData.institution) {
      newErrors.institution = 'Institution is required';
    } else if (!INSTITUTIONS.includes(formData.institution)) {
      newErrors.institution = 'Please select a valid institution from the list';
    }

    // Security Code validation
    if (!formData.securityCode) {
      newErrors.securityCode = 'Security code is required';
    } else if (formData.securityCode !== displaySecurityCode) {
      newErrors.securityCode = 'Invalid security code';
      setSecurityCodeError('Invalid security code. Please try again.');
      generateSecurityCode(); // Generate new code when invalid
      setFormData(prev => ({ ...prev, securityCode: '' })); // Clear security code input
      throw new Error('Invalid security code');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      throw new Error('Please correct the errors before submitting');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Validate form
      validateForm();

      // Generate applicant ID first
      const timestamp = Date.now();
      const applicantId = `AP${timestamp.toString().slice(-8)}`;

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const userId = userCredential.user.uid;

      // Prepare student data
      const studentData = {
        userId: userId,  // Store userId as a field
        applicantId: applicantId,
        name: formData.fullName,
        aadharName: formData.aadharName,
        email: formData.email,
        mobile: formData.mobile,
        gender: formData.gender,
        religion: formData.religion,
        caste: formData.caste,
        dateOfBirth: formData.dateOfBirth,
        qualifyingExam: formData.qualifyingExam,
        board: formData.board,
        rollNo: formData.rollNo,
        year: formData.year,
        totalMarks: parseFloat(formData.totalMarks),
        marksObtained: parseFloat(formData.marksObtained),
        percentage: parseFloat(formData.percentage),
        institution: formData.institution,
        courseName: formData.courseName,
        courseDuration: formData.courseDuration,
        // Initial application status
        applicationSubmitted: false,
        status: 'PENDING',
        // Timestamps
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        // Initialize empty fields for application form data
        address: {
          current: '',
          permanent: '',
          district: '',
          state: '',
          pinCode: '',
          houseNo: '',
          streetName: '',
          townVillage: ''
        },
        bankDetails: {
          accountNumber: '',
          bankName: '',
          branchName: '',
          ifscCode: ''
        },
        parentDetails: {
          fatherName: '',
          motherName: '',
          guardianName: '',
          occupation: '',
          annualIncome: ''
        },
        documents: {
          applicantImage: '',
          applicantSignature: '',
          hsMarksheet: '',
          madhyamikAdmit: '',
          admissionReceipt: '',
          bankPassbook: '',
          aadharCard: '',
          casteCertificate: '',
          incomeCertificate: ''
        }
      };

      // Save to Firestore using applicantId as document ID
      const studentRef = doc(db, 'students', applicantId);
      await setDoc(studentRef, studentData);

      // Set application ID and open success dialog
      setApplicationId(applicantId);
      setIsSuccessDialogOpen(true);
      
      // Clear form
      setFormData({
        fullName: '',
        aadharName: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobile: '',
        gender: '',
        religion: '',
        caste: '',
        dateOfBirth: '',
        qualifyingExam: '',
        board: '',
        rollNo: '',
        year: '',
        totalMarks: '',
        marksObtained: '',
        percentage: '',
        institution: '',
        courseName: '',
        courseDuration: '',
        securityCode: ''
      });

    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstructionsAccepted = () => {
    setShowInstructionsDialog(false);
  };

  const handleNavigateToAbout = () => {
    onClose();
    navigate('/about');
  };

  const handleCloseSuccessDialog = () => {
    setIsSuccessDialogOpen(false);
    onClose(); // Close the registration modal
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      {/* Instructions Dialog */}
      <Dialog
        open={open && showInstructionsDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: blue[500],
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <InfoIcon />
          <Typography variant="h6">Important Notice</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" paragraph>
            Before applying for the scholarship, please read the eligibility criteria and other important information in the 'About' page.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNavigateToAbout}
              startIcon={<InfoIcon />}
              sx={{ borderRadius: 2 }}
            >
              View Eligibility Criteria
            </Button>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={instructionsAccepted}
                onChange={(e) => setInstructionsAccepted(e.target.checked)}
                color="primary"
              />
            }
            label="I declare that I have read the instructions properly and I agree to abide by them"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              ml: 0,
              mt: 1
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInstructionsAccepted}
            variant="contained"
            color="primary"
            disabled={!instructionsAccepted}
            sx={{ borderRadius: 2 }}
          >
            Proceed to Registration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Registration Dialog */}
      <Dialog 
        open={open && !showInstructionsDialog} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#f9f9fc',
            position: 'relative',
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            backgroundColor: blue[500], 
            color: 'white', 
            py: 2, 
            px: 3,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Student Registration
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent 
          sx={{ 
            p: 3,
            backgroundColor: 'white',
            borderRadius: 2,
            '& .MuiTextField-root': {
              mb: 2
            }
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: 'error.main'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 2, 
                backgroundColor: grey[50],
                borderRadius: 2,
                border: `1px solid ${grey[200]}`
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name (as per Aadhaar)"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.fullName)}
                    helperText={errors.fullName}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name in Aadhaar"
                    name="aadharName"
                    value={formData.aadharName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      label="Gender"
                      required
                    >
                      {GENDERS.map(gender => (
                        <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Religion</InputLabel>
                    <Select
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      label="Religion"
                      required
                    >
                      {RELIGIONS.map(religion => (
                        <MenuItem key={religion} value={religion}>{religion}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Caste</InputLabel>
                    <Select
                      name="caste"
                      value={formData.caste}
                      onChange={handleChange}
                      label="Caste"
                      required
                    >
                      {CASTES.map(caste => (
                        <MenuItem key={caste} value={caste}>{caste}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Qualifying Exam</InputLabel>
                    <Select
                      name="qualifyingExam"
                      value={formData.qualifyingExam}
                      onChange={handleChange}
                      label="Qualifying Exam"
                      required
                    >
                      {QUALIFYING_EXAMS.map(exam => (
                        <MenuItem key={exam} value={exam}>{exam}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Board</InputLabel>
                    <Select
                      name="board"
                      value={formData.board}
                      onChange={handleChange}
                      label="Board"
                      required
                    >
                      {BOARDS.map(board => (
                        <MenuItem key={board} value={board}>{board}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Roll No"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Total Marks"
                    name="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Marks Obtained"
                    name="marksObtained"
                    type="number"
                    value={formData.marksObtained}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Percentage"
                    name="percentage"
                    value={formData.percentage}
                    InputProps={{ 
                      readOnly: true,
                      endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>%</Typography>
                    }}
                    sx={{
                      '& input': {
                        color: parseFloat(formData.percentage) < 60 ? 'error.main' : 'success.main',
                        fontWeight: 'bold'
                      }
                    }}
                    helperText={
                      parseFloat(formData.percentage) < 60 
                        ? "Minimum 60% required" 
                        : formData.percentage && "Eligible percentage"
                    }
                    FormHelperTextProps={{
                      sx: {
                        color: parseFloat(formData.percentage) < 60 ? 'error.main' : 'success.main'
                      }
                    }}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    id="institution"
                    options={INSTITUTIONS}
                    value={formData.institution}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        institution: newValue || ''
                      }));
                      setErrors(prev => ({
                        ...prev,
                        institution: ''
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="institution"
                        label="Institution"
                        required
                        error={Boolean(errors.institution)}
                        helperText={errors.institution}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            }
                          }
                        }}
                      />
                    )}
                    freeSolo
                    autoSelect
                    filterOptions={(options, params) => {
                      const filtered = options.filter(option =>
                        option.toLowerCase().includes(params.inputValue.toLowerCase())
                      );
                      return filtered;
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Course Name"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Course Duration (Years)"
                    name="courseDuration"
                    type="number"
                    value={formData.courseDuration}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.courseDuration)}
                    helperText={errors.courseDuration}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.dateOfBirth)}
                    helperText={errors.dateOfBirth}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                          size="large"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPassword}
                          edge="end"
                          size="large"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2,
                      mb: 2,
                      backgroundColor: grey[50],
                      borderRadius: 2,
                      border: `1px solid ${grey[200]}`,
                      width: '50%',
                      mx: 'auto'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Security Verification
                      </Typography>
                      <IconButton 
                        onClick={generateSecurityCode}
                        size="small"
                        sx={{ color: blue[500] }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    <Typography 
                      variant="h6" 
                      align="center"
                      sx={{ 
                        fontFamily: 'monospace',
                        letterSpacing: 4,
                        fontWeight: 'bold',
                        color: blue[700],
                        mb: 2,
                        userSelect: 'none'
                      }}
                    >
                      {displaySecurityCode}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Enter Security Code"
                      name="securityCode"
                      value={formData.securityCode}
                      onChange={handleChange}
                      required
                      error={Boolean(securityCodeError)}
                      helperText={securityCodeError}
                      placeholder="Enter the code shown above"
                      sx={{ 
                        mb: 0,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white'
                        }
                      }}
                      inputProps={{
                        maxLength: 5,
                        style: { letterSpacing: 2, textAlign: 'center' }
                      }}
                    />
                    {securityCodeError && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mt: 1,
                          '& .MuiAlert-message': {
                            fontSize: '13px'
                          }
                        }}
                      >
                        {securityCodeError}
                      </Alert>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 2 
              }}
            >
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={onClose}
                sx={{ 
                  borderRadius: 2,
                  px: 3
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {loading ? <CircularProgress size={20} /> : <LockIcon />}
                Register
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={isSuccessDialogOpen}
        onClose={handleCloseSuccessDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            color: blue[700], 
            fontWeight: 'bold',
            pt: 3 
          }}
        >
          Registration Successful
        </DialogTitle>
        <DialogContent>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              py: 2 
            }}
          >
            <Typography variant="body1" gutterBottom>
              Your Application ID is:
            </Typography>
            <Typography 
              variant="h5" 
              color="primary" 
              sx={{ 
                my: 2, 
                p: 2, 
                bgcolor: blue[50], 
                borderRadius: 2,
                fontWeight: 'bold',
                letterSpacing: 1
              }}
            >
              {applicationId}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                textAlign: 'center',
                mb: 2 
              }}
            >
              Please save your Application ID. You will need it to login to your account.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleCloseSuccessDialog} 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 2,
              px: 4, 
              py: 1.5 
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RegistrationModal;
