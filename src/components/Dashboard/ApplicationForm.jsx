import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Box,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  IconButton,
  FormLabel,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import DownloadIcon from '@mui/icons-material/Download';
import ApplicationPDF from './ApplicationPDF';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { green } from '@mui/material/colors';
import DeleteIcon from '@mui/icons-material/Delete';
import * as Yup from 'yup';

const ApplicationForm = ({ 
  open, 
  onClose, 
  studentData, 
  applicationData,
  onSubmitSuccess 
}) => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    ...applicationData,
    // Personal Information
    name: applicationData?.name || '',
    email: applicationData?.email || '',
    phone: applicationData?.phone || '',
    gender: applicationData?.gender || '',
    category: applicationData?.category || '',
    religion: applicationData?.religion || '',
    dateOfBirth: applicationData?.dateOfBirth || '',
    
    // Disability and Domicile
    isDomiciled: '',
    isDifferentlyAbled: '',
    differentlyAbledPercentage: '',
    
    // Bank Details
    bankName: applicationData?.bankDetails?.bankName || '',
    ifscCode: applicationData?.bankDetails?.ifscCode || '',
    accountNo: applicationData?.bankDetails?.accountNo || '',
    accountHolderName: applicationData?.bankDetails?.accountHolderName || '',
    branchName: applicationData?.bankDetails?.branchName || '',
    
    // Guardian Details
    guardianName: applicationData?.guardianDetails?.name || '',
    guardianRelation: applicationData?.guardianDetails?.relation || '',
    guardianOccupation: applicationData?.guardianDetails?.occupation || '',
    guardianAnnualIncome: applicationData?.guardianDetails?.annualIncome || '',
    guardianMobile: applicationData?.guardianDetails?.mobile || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [incomeProofType, setIncomeProofType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(applicationData?.applicationSubmitted || false);
  const [documentFiles, setDocumentFiles] = useState({});
  const [documentBase64, setDocumentBase64] = useState({});
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [uploadedFiles, setUploadedFiles] = useState({});

  const INCOME_PROOF_TYPES = [
    'INCOME CERTIFICATE FROM SDO',
    'INCOME CERTIFICATE FROM BDO',
    'SALARY SLIP',
    'FORM 16',
    'IT RETURN',
    'OTHER'
  ];

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file changes
  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Check file size (20KB = 20480 bytes)
      if (file.size > 20480) {
        setError(`${name} size exceeds 20KB limit. Please upload a smaller file.`);
        e.target.value = ''; // Reset input
        setUploadedFiles(prev => ({
          ...prev,
          [name]: false
        }));
        return;
      }

      try {
        // Store the file object
        setDocumentFiles(prev => ({
          ...prev,
          [name]: file
        }));

        // Convert to base64 and store
        const base64 = await fileToBase64(file);
        setDocumentBase64(prev => ({
          ...prev,
          [name]: base64
        }));

        // Mark file as uploaded
        setUploadedFiles(prev => ({
          ...prev,
          [name]: true
        }));

        setError(''); // Clear any previous errors
      } catch (error) {
        console.error(`Error processing ${name}:`, error);
        setError(`Failed to process ${name}. Please try again.`);
        setUploadedFiles(prev => ({
          ...prev,
          [name]: false
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Convert text inputs to uppercase
    if (typeof value === 'string' && name !== 'email' && !name.includes('password')) {
      newValue = value.toUpperCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    if (name === 'sameAsCurrentAddress' && checked) {
      setFormData(prev => ({
        ...prev,
        permanentAddress: prev.currentAddress,
        sameAsCurrentAddress: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (viewMode) {
      onClose();
      return;
    }

    // Basic validation
    if (!formData.isDomiciled || formData.isDomiciled === 'no') {
      setError('This scholarship is only available for residents of West Bengal');
      return;
    }

    if (!formData.isDifferentlyAbled) {
      setError('Please select whether you are differently abled');
      return;
    }

    if (formData.isDifferentlyAbled === 'yes' && !formData.differentlyAbledPercentage) {
      setError('Please enter disability percentage');
      return;
    }

    // Check if bank account numbers match
    if (formData.accountNo !== formData.confirmAccountNo) {
      setError('Bank account numbers do not match');
      return;
    }

    // Check terms acceptance
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    // If all validations pass, show confirmation dialog
    setError(''); // Clear any previous errors
    setConfirmDialog(true); // Show confirmation dialog
  };

  const handleConfirmSubmit = async () => {
    try {
      setError('');
      setLoading(true);
      setConfirmDialog(false);

      if (!studentData?.applicantId) {
        throw new Error('Invalid student data or applicant ID missing.');
      }

      const updatedStudentData = {
        // Preserve existing student data
        ...studentData,
        
        // Update personal information with null checks
        name: formData.name || studentData.name || '',
        email: formData.email || studentData.email || '',
        phone: formData.phone || studentData.phone || '',
        gender: formData.gender || studentData.gender || '',
        category: formData.category || studentData.category || '',
        religion: formData.religion || studentData.religion || '',
        dateOfBirth: formData.dateOfBirth || studentData.dateOfBirth || '',
        
        // Application status
        applicationSubmitted: true,
        applicationDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: 'SUBMITTED',
        statusMessage: 'Application resubmitted and under review.',
        applicationUnlocked: false,
        applicationRejected: false,
        
        // Guardian details with null checks
        guardianDetails: {
          name: formData.guardianName || '',
          relation: formData.guardianRelation || '',
          occupation: formData.guardianOccupation || '',
          annualIncome: formData.guardianAnnualIncome || '',
          mobile: formData.guardianMobile || '',
          domiciled: formData.isDomiciled === 'yes'
        },
        
        // Rest of the data...
        isDomiciled: formData.isDomiciled === 'yes',
        isDifferentlyAbled: formData.isDifferentlyAbled === 'yes',
        differentlyAbledPercentage: formData.isDifferentlyAbled === 'yes' 
          ? formData.differentlyAbledPercentage 
          : null,
        
        // Update address
        address: {
          current: formData.currentAddress,
          permanent: formData.sameAsCurrentAddress ? formData.currentAddress : formData.permanentAddress,
          houseNo: formData.houseNo,
          streetName: formData.streetName,
          townVillage: formData.townVillage,
          pinCode: formData.pinCode,
          state: 'WEST BENGAL',
          district: formData.district
        },
        
        // Update bank details
        bankDetails: {
          bankName: formData.bankName || '',
          ifscCode: (formData.ifscCode || '').toUpperCase(),
          accountNo: formData.accountNo || '',
          accountHolderName: formData.accountHolderName || '',
          ...(formData.branchName && { branchName: formData.branchName })
        }
      };

      // If there are new documents, add them
      if (Object.keys(documentBase64).length > 0) {
        updatedStudentData.documents = {
          ...updatedStudentData.documents, // Preserve existing documents
          ...documentBase64, // Add new documents
          incomeProofType: incomeProofType
        };
      }

      // Update the document in Firestore
      const studentRef = doc(db, 'students', studentData.applicantId);
      await updateDoc(studentRef, updatedStudentData);

      // Add status history entry
      const statusHistoryRef = collection(db, 'students', studentData.applicantId, 'statusHistory');
      await addDoc(statusHistoryRef, {
        status: 'SUBMITTED',
        statusMessage: 'Application Resubmitted',
        remarks: 'Application has been resubmitted after unlocking',
        date: new Date().toISOString(),
        updatedBy: 'STUDENT'
      });

      // Show success message
      setSuccessMessage('Application resubmitted successfully! Redirecting...');
      
      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(updatedStudentData);
      }

      // Close the form
      onClose();

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const studentRef = doc(db, 'students', studentData.applicantId);
      const docSnap = await getDoc(studentRef);
      if (!docSnap.exists()) {
        throw new Error('Application data not found');
      }

      const data = {
        ...docSnap.data(),
        studentData // Include student data for the PDF
      };

      return (
        <PDFDownloadLink
          document={<ApplicationPDF data={data} />}
          fileName={`scholarship-application-${studentData.applicantId}.pdf`}
        >
          {({ blob, url, loading, error }) =>
            loading ? 'Loading document...' : 'Download PDF'
          }
        </PDFDownloadLink>
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  useEffect(() => {
    // Set view mode if application is submitted and not unlocked
    setViewMode(applicationData?.applicationSubmitted && !applicationData?.applicationUnlocked);
    setIsSubmitted(applicationData?.applicationSubmitted || false);
  }, [applicationData]);

  const renderDocumentUpload = (name, label) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="subtitle2" gutterBottom>
        {label} * <span style={{ color: 'red', fontSize: '0.8rem' }}>(JPG/PNG under 20KB)</span>
        </Typography>
      <Box sx={{ 
                  border: '1px solid',
        borderColor: uploadedFiles[name] ? green[500] : '#ccc',
                  borderRadius: 1,
        p: 2,
        backgroundColor: uploadedFiles[name] ? green[50] : '#f5f5f5',
                  position: 'relative',
                  transition: 'all 0.3s ease'
      }}>
                <input
                  type="file"
          accept="image/jpeg,image/png"
          name={name}
          onChange={handleFileChange}
          required
          style={{ width: '100%' }}
        />
        {uploadedFiles[name] && (
          <CheckCircleIcon 
                    sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: green[500]
            }} 
          />
                  )}
                </Box>
            </Grid>
  );

  const renderIncomeDocumentUpload = () => (
    <Grid item xs={12}>
      <Typography variant="subtitle2" gutterBottom>
        Income Certificate * <span style={{ color: 'red', fontSize: '0.8rem' }}>(JPG/PNG under 20KB)</span>
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Income Proof Type</InputLabel>
            <Select
              value={incomeProofType}
              onChange={(e) => setIncomeProofType(e.target.value)}
              label="Income Proof Type"
              disabled={isSubmitted || viewMode}
            >
              {INCOME_PROOF_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ 
            border: '1px solid',
            borderColor: uploadedFiles['incomeCertificate'] ? green[500] : '#ccc',
            borderRadius: 1,
            p: 2,
            backgroundColor: uploadedFiles['incomeCertificate'] ? green[50] : '#f5f5f5',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}>
            <input
              type="file"
              accept="image/jpeg,image/png"
              name="incomeCertificate"
              onChange={handleFileChange}
              required
              style={{ width: '100%' }}
              disabled={!incomeProofType || isSubmitted || viewMode}
            />
            {uploadedFiles['incomeCertificate'] && (
              <CheckCircleIcon 
                sx={{ 
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: green[500]
                }} 
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );

  const validationSchema = Yup.object().shape({
    isDomiciled: Yup.string()
      .required('Please select whether you are domiciled in West Bengal'),
    isDifferentlyAbled: Yup.string()
      .required('Please select whether you are differently abled'),
    differentlyAbledPercentage: Yup.string()
      .when('isDifferentlyAbled', {
        is: 'yes',
        then: Yup.string()
          .required('Please enter disability percentage')
          .matches(/^[0-9]{1,2}$|^100$/, 'Please enter a valid percentage between 0-100')
      })
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Application Form
          {isSubmitted && (
            <Box sx={{ float: 'right' }}>
              <PDFDownloadLink
                document={<ApplicationPDF data={{ ...formData, studentData }} />}
                fileName={`scholarship-application-${studentData.applicantId}.pdf`}
                style={{ textDecoration: 'none' }}
              >
                {({ blob, url, loading, error }) => (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Download Application'}
                  </Button>
                )}
              </PDFDownloadLink>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            {/* Student Information (Read-only) */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              STUDENT INFORMATION
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.name || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.email || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Application ID
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.applicantId || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Date of Birth
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.dateOfBirth || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Academic Details (Read-only) */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              ACADEMIC DETAILS
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Qualifying Exam
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.qualifyingExam || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Board
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.board || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Year
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.year || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Roll No
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.rollNo || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Percentage
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.percentage || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Institution
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.institution || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Course Name
                </Typography>
                <TextField
                  fullWidth
                  value={studentData?.courseName || ''}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Course Duration
                </Typography>
                <TextField
                  fullWidth
                  value={`${studentData?.courseDuration || ''} Years`}
                  InputProps={{ readOnly: true }}
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Parents Details */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              PARENTS DETAILS
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Guardian Full Name *
                </Typography>
                <TextField
                  fullWidth
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <Typography variant="subtitle2" gutterBottom>
                    Relation with Guardian *
                  </Typography>
                  <RadioGroup
                    row
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="FATHER" control={<Radio />} label="Father" />
                    <FormControlLabel value="MOTHER" control={<Radio />} label="Mother" />
                    <FormControlLabel value="BROTHER" control={<Radio />} label="Brother" />
                    <FormControlLabel value="OTHER" control={<Radio />} label="Other" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Guardian Occupation</InputLabel>
                  <Select
                    name="guardianOccupation"
                    value={formData.guardianOccupation}
                    onChange={handleChange}
                    disabled={isSubmitted || viewMode}
                    label="Guardian Occupation"
                  >
                    <MenuItem value="FARMER">FARMER</MenuItem>
                    <MenuItem value="SMALL BUSINESS">SMALL BUSINESS</MenuItem>
                    <MenuItem value="BUSINESS">BUSINESS</MenuItem>
                    <MenuItem value="PRIVATE JOB">PRIVATE JOB</MenuItem>
                    <MenuItem value="GOVT.JOB">GOVT.JOB</MenuItem>
                    <MenuItem value="OTHERS">OTHERS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Guardian Annual Income *
                </Typography>
                <TextField
                  fullWidth
                  name="guardianAnnualIncome"
                  type="number"
                  value={formData.guardianAnnualIncome}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  InputProps={{
                    startAdornment: <span style={{ marginRight: '8px' }}>₹</span>
                  }}
                  helperText="Annual income in INR"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Whether the applicant is domiciled in West Bengal? *
                </Typography>
                <FormControl 
                  required 
                  error={error && !formData.isDomiciled}
                  disabled={isSubmitted || viewMode}
                  sx={{ width: '100%' }}
                >
                  <RadioGroup
                    row
                    name="isDomiciled"
                    value={formData.isDomiciled}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'no') {
                        alert('This scholarship is only available for residents of West Bengal');
                        setError('This scholarship is only available for residents of West Bengal');
                        return;
                      }
                      setFormData(prev => ({
                        ...prev,
                        isDomiciled: value
                      }));
                      setError(''); // Clear error when "Yes" is selected
                    }}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                  {error && !formData.isDomiciled && (
                    <FormHelperText error sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {error}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Whether Differently Abled? *
                </Typography>
                <FormControl 
                  required 
                  error={error && !formData.isDifferentlyAbled}
                  disabled={isSubmitted || viewMode}
                >
                  <RadioGroup
                    row
                    name="isDifferentlyAbled"
                    value={formData.isDifferentlyAbled}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        isDifferentlyAbled: value,
                        differentlyAbledPercentage: value === 'no' ? '' : prev.differentlyAbledPercentage
                      }));
                    }}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {formData.isDifferentlyAbled === 'yes' && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Disability Percentage *
                  </Typography>
                  <TextField
                    fullWidth
                    name="differentlyAbledPercentage"
                    value={formData.differentlyAbledPercentage}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                        setFormData(prev => ({
                          ...prev,
                          differentlyAbledPercentage: value
                        }));
                      }
                    }}
                    required
                    disabled={isSubmitted || viewMode}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ 
                      min: 0, 
                      max: 100,
                      style: { textAlign: 'right' }
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              )}
            </Grid>

            {/* Address */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              ADDRESS
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Current Address *
                </Typography>
                <TextField
                  fullWidth
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="sameAsCurrentAddress"
                      checked={formData.sameAsCurrentAddress}
                      onChange={handleCheckbox}
                      disabled={isSubmitted || viewMode}
                    />
                  }
                  label="Same as Current Address"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Permanent Address *
                </Typography>
                <TextField
                  fullWidth
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                  disabled={isSubmitted || viewMode || formData.sameAsCurrentAddress}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  House No *
                </Typography>
                <TextField
                  fullWidth
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Street Name *
                </Typography>
                <TextField
                  fullWidth
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Town/Village *
                </Typography>
                <TextField
                  fullWidth
                  name="townVillage"
                  value={formData.townVillage}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  PIN Code *
                </Typography>
                <TextField
                  fullWidth
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  State
                </Typography>
                <TextField
                  fullWidth
                  value="WEST BENGAL"
                  disabled
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  District *
                </Typography>
                <TextField
                  fullWidth
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Bank Details */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              BANK DETAILS
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Bank Name *
                </Typography>
                <TextField
                  fullWidth
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  IFSC Code *
                </Typography>
                <TextField
                  fullWidth
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Account Number *
                </Typography>
                <TextField
                  fullWidth
                  name="accountNo"
                  value={formData.accountNo}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Confirm Account Number *
                </Typography>
                <TextField
                  fullWidth
                  name="confirmAccountNo"
                  value={formData.confirmAccountNo}
                  onChange={handleChange}
                  required
                  disabled={isSubmitted || viewMode}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Upload Documents */}
            {!isSubmitted && !viewMode && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  UPLOAD DOCUMENTS
                </Typography>
                <Grid container spacing={2}>
                  {renderDocumentUpload('applicantImage', 'Applicant Image')}
                  {renderDocumentUpload('applicantSignature', 'Applicant Signature')}
                  {renderDocumentUpload('hsMarksheet', 'HS Marksheet')}
                  {renderDocumentUpload('madhyamikAdmit', 'Madhyamik Admit Card')}
                  {renderDocumentUpload('admissionReceipt', 'Admission Receipt')}
                  {renderDocumentUpload('bankPassbook', 'Bank Passbook Copy')}
                  {renderDocumentUpload('aadharCard', 'Aadhar Card')}
                  {renderDocumentUpload('casteCertificate', 'Caste Certificate')}
                  {renderIncomeDocumentUpload()}
                </Grid>
              </>
            )}

            {/* Terms and Submit */}
            {!isSubmitted && !viewMode && (
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                    />
                  }
                  label="I hereby declare that all the information provided is true to the best of my knowledge"
                />
              </Box>
            )}

            {/* Submit Button */}
            {!isSubmitted && !viewMode && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !termsAccepted}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              </Box>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit the application? Once submitted, you won't be able to edit it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={loading}>Back</Button>
          <Button 
            onClick={handleConfirmSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Submitting...
              </Box>
            ) : (
              'Yes, Submit'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplicationForm;