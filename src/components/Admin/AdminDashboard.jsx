import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  InputLabel,
  OutlinedInput,
  Divider,
  CloseIcon
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Logout as LogoutIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

const db = getFirestore();

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scholarshipStatus, setScholarshipStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('All Institutions');

  useEffect(() => {
    // Check admin authentication
    const loginId = sessionStorage.getItem('loginId');
    const userType = sessionStorage.getItem('userType');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');

    if (!isAuthenticated || !loginId || userType !== 'admin' || loginId !== 'ADMIN2025') {
      navigate('/admin-login');
      return;
    }

    fetchApprovedStudents();
  }, [navigate]);

  const fetchApprovedStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting to fetch approved students...');
      const studentsRef = collection(db, 'students');
      
      // Query for students that have been approved by institution and forwarded to admin
      const approvedQuery = query(
        studentsRef,
        where('applicationApproved', '==', true),
        where('forwardedToAdmin', '==', true)
      );

      const approvedSnapshot = await getDocs(approvedQuery);
      console.log('Found approved applications:', approvedSnapshot.size);

      const approvedStudents = [];
      
      approvedSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Raw student data:', data);

        // Extract all student data
        const studentData = {
          id: doc.id,
          applicationId: data.applicationId || '',
          name: data.name || data.fullName || 'N/A',
          institutionName: data.institution || data.institutionName || 'N/A',
          status: data.status || 'APPROVED',
          scholarshipStatus: data.scholarshipStatus || 'PENDING',
          // Personal Information
          email: data.email || 'N/A',
          mobile: data.mobile || data.phone || 'N/A',
          address: data.address || 'N/A',
          gender: data.gender || 'N/A',
          dob: data.dob || 'N/A',
          category: data.category || data.caste || 'N/A',
          // Academic Information
          course: data.course || 'N/A',
          courseDuration: data.courseDuration || 'N/A',
          admissionYear: data.year || data.admissionYear || 'N/A',
          // Additional Information
          fatherName: data.fatherName || 'N/A',
          motherName: data.motherName || 'N/A',
          annualIncome: data.annualIncome || 'N/A',
          remarks: data.remarks || '',
          lastUpdated: data.lastUpdated || '',
          createdAt: data.createdAt || ''
        };
        
        console.log('Processed student data:', studentData);
        approvedStudents.push(studentData);
      });

      if (approvedStudents.length === 0) {
        console.log('No approved students found');
        setError('No approved applications found. Please check back later.');
      } else {
        console.log(`Successfully loaded ${approvedStudents.length} approved students`);
      }
      
      setStudents(approvedStudents);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code
      });
      setError(`Failed to fetch students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    selectedInstitution === 'All Institutions' || student.institutionName === selectedInstitution
  );

  const handleViewDetails = (student) => {
    console.log('Viewing details for student:', student);
    setSelectedStudent(student);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setScholarshipStatus('');
    setRemarks('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedStudent || !scholarshipStatus) return;

    try {
      const studentRef = doc(db, 'students', selectedStudent.id);
      const timestamp = new Date().toISOString();

      // Get current document to access existing history
      const docSnap = await getDoc(studentRef);
      if (!docSnap.exists()) {
        throw new Error('Student document not found');
      }

      const currentData = docSnap.data();
      const currentHistory = currentData.statusHistory || [];

      // Prepare status message
      const statusMessage = scholarshipStatus === 'SCHOLARSHIP_SANCTIONED'
        ? 'Scholarship Sanctioned by Administrator'
        : 'Application Rejected by Administrator';

      // Create history entry
      const historyEntry = {
        date: timestamp,
        status: scholarshipStatus,
        statusMessage: statusMessage,
        remarks: remarks || '',
        updatedBy: 'ADMIN'
      };

      // Prepare update data
      const updateData = {
        scholarshipStatus: scholarshipStatus,
        adminRemarks: remarks,
        lastUpdated: timestamp,
        statusMessage: statusMessage,
        statusHistory: [...currentHistory, historyEntry],
        adminStatus: scholarshipStatus
      };

      console.log('Updating student with data:', updateData);
      await updateDoc(studentRef, updateData);

      // Update local state
      setStudents(students.map(student => 
        student.id === selectedStudent.id 
          ? { ...student, ...updateData }
          : student
      ));

      handleCloseDialog();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update scholarship status: ' + err.message);
    }
  };

  const handleLogout = () => {
    // Clear all session data
    sessionStorage.clear();
    localStorage.clear(); // Clear any local storage data as well
    // Redirect to login page
    navigate('/admin-login', { replace: true });
  };

  const renderStudentDetailsDialog = (student) => {
    if (!student) return null;

    return (
      <Dialog open={Boolean(selectedStudent)} onClose={() => setSelectedStudent(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          Student Details
          <IconButton
            aria-label="close"
            onClick={() => setSelectedStudent(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><strong>Name:</strong> {student.name}</Typography>
                  <Typography><strong>Application ID:</strong> {student.applicationId}</Typography>
                  <Typography><strong>Email:</strong> {student.email}</Typography>
                  <Typography><strong>Mobile:</strong> {student.mobile}</Typography>
                  <Typography><strong>Gender:</strong> {student.gender}</Typography>
                  <Typography><strong>Date of Birth:</strong> {student.dob}</Typography>
                  <Typography><strong>Category:</strong> {student.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Father's Name:</strong> {student.fatherName}</Typography>
                  <Typography><strong>Mother's Name:</strong> {student.motherName}</Typography>
                  <Typography><strong>Annual Income:</strong> {student.annualIncome}</Typography>
                  <Typography><strong>Address:</strong> {student.address}</Typography>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Academic Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><strong>Institution:</strong> {student.institutionName}</Typography>
                  <Typography><strong>Course:</strong> {student.course}</Typography>
                  <Typography><strong>Course Duration:</strong> {student.courseDuration}</Typography>
                  <Typography><strong>Admission Year:</strong> {student.admissionYear}</Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Application Status</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><strong>Status:</strong> {student.status}</Typography>
                  <Typography><strong>Scholarship Status:</strong> {student.scholarshipStatus}</Typography>
                  <Typography><strong>Remarks:</strong> {student.remarks}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Last Updated:</strong> {student.lastUpdated}</Typography>
                  <Typography><strong>Created At:</strong> {student.createdAt}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedStudent(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        py: 2, 
        px: 3, 
        mb: 3,
        boxShadow: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Admin Dashboard
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ 
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
                fontWeight: 'bold'
              }}
            >
              Logout
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Paper sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: 3
        }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 3, 
              color: 'text.primary',
              fontWeight: 'medium'
            }}
          >
            Approved Applications
          </Typography>

          <Box sx={{ mb: 4 }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Institution Filter</InputLabel>
              <Select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                label="Institution Filter"
                size="small"
                sx={{ bgcolor: 'background.paper' }}
              >
                <MenuItem value="All Institutions">All Institutions</MenuItem>
                {Array.from(new Set(students.map(s => s.institutionName)))
                  .filter(name => name !== 'N/A' && name !== 'All Institutions')
                  .sort()
                  .map(institution => (
                    <MenuItem 
                      value={institution} 
                      key={`inst-${institution.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {institution}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <TableContainer sx={{ 
            boxShadow: 1,
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Application ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Institution</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box sx={{ py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          No approved applications found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell>{student.applicationId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.institutionName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={student.scholarshipStatus}
                          color={
                            student.scholarshipStatus === 'SCHOLARSHIP_SANCTIONED' 
                              ? 'success'
                              : student.scholarshipStatus === 'REJECTED'
                              ? 'error'
                              : 'default'
                          }
                          sx={{ 
                            fontWeight: 'medium',
                            minWidth: 100
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(student)}
                          sx={{ 
                            minWidth: 120,
                            textTransform: 'none'
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {renderStudentDetailsDialog(selectedStudent)}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
