import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
  useTheme
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Edit as EditIcon,
  Logout as LogoutIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
const auth = getAuth();

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterInstitution, setFilterInstitution] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openStudentDetailsDialog, setOpenStudentDetailsDialog] = useState(false);
  const [openStatusUpdateDialog, setOpenStatusUpdateDialog] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchApprovedStudents = async () => {
      try {
        setLoading(true);
        const studentsRef = collection(db, 'students');
        
        // Query for approved students
        const q = query(
          studentsRef, 
          where('status', '==', 'APPROVED')
        );

        const querySnapshot = await getDocs(q);
        
        const fetchedStudents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          studentData: doc.data()
        }));

        setStudents(fetchedStudents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch student data');
        setLoading(false);
      }
    };

    fetchApprovedStudents();
  }, []);

  const handleUpdateStudentStatus = async (newStatus) => {
    if (!selectedStudent) return;

    try {
      // Update student status in Firestore
      const studentDocRef = doc(db, 'students', selectedStudent.id);
      await updateDoc(studentDocRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        sanctionedAt: newStatus === 'SANCTIONED' ? new Date().toISOString() : null,
        sanctionedBy: newStatus === 'SANCTIONED' ? 'HOA' : null
      });

      // Update local state
      setStudents(prev => 
        prev.map(student => 
          student.id === selectedStudent.id 
            ? { ...student, status: newStatus } 
            : student
        )
      );

      // Close dialogs
      setOpenStatusUpdateDialog(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Error updating student status:', err);
      setError('Failed to update student status');
    }
  };

  // Get unique institutions from approved students
  const institutions = [...new Set(students.map(student => student.institutionName))];

  // Filter students based on institution
  const filteredStudents = students.filter(student => 
    filterInstitution === 'ALL' || student.institutionName === filterInstitution
  );

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderStatusUpdateDialog = () => {
    return (
      <Dialog 
        open={openStatusUpdateDialog} 
        onClose={() => {
          setOpenStatusUpdateDialog(false);
          setSelectedStudent(null);
        }}
      >
        <DialogTitle>Update Student Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={selectedStudent?.status || ''}
              label="New Status"
              onChange={(e) => handleUpdateStudentStatus(e.target.value)}
            >
              <MenuItem value="SANCTIONED">Sanctioned</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenStatusUpdateDialog(false);
              setSelectedStudent(null);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      {/* Admin Header */}
      <AppBar position="static" sx={{ backgroundColor: '#34495e' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src="/wb.png" sx={{ width: 40, height: 40, mr: 2 }} />
            <Typography variant="h6">
              VikasPath Scholarship - Admin Panel
            </Typography>
          </Box>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Dashboard Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant="h6">Total Approved</Typography>
              <Typography variant="h4">{students.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="h6">Sanctioned</Typography>
              <Typography variant="h4">
                {students.filter(s => s.status === 'SANCTIONED').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h6">Pending Sanction</Typography>
              <Typography variant="h4">
                {students.filter(s => s.status === 'APPROVED').length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Institution</InputLabel>
                <Select
                  value={filterInstitution}
                  label="Filter by Institution"
                  onChange={(e) => setFilterInstitution(e.target.value)}
                >
                  <MenuItem value="ALL">All Institutions</MenuItem>
                  {institutions.map(inst => (
                    <MenuItem key={inst} value={inst}>{inst}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Students Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Applicant ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Institution</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow 
                  key={student.id}
                  sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  <TableCell>{student.studentData?.applicantId}</TableCell>
                  <TableCell>{student.studentData?.name}</TableCell>
                  <TableCell>{student.studentData?.institution}</TableCell>
                  <TableCell>{student.studentData?.courseName}</TableCell>
                  <TableCell>{student.studentData?.category}</TableCell>
                  <TableCell>
                    <Chip 
                      label={student.status}
                      color={
                        student.status === 'SANCTIONED' ? 'success' :
                        student.status === 'APPROVED' ? 'primary' : 'default'
                      }
                      sx={{ minWidth: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton 
                        color="primary"
                        onClick={() => {
                          setSelectedStudent(student);
                          setOpenStudentDetailsDialog(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Student Details Dialog */}
        <Dialog 
          open={openStudentDetailsDialog} 
          onClose={() => setOpenStudentDetailsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Application Details</Typography>
            <IconButton onClick={() => setOpenStudentDetailsDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {selectedStudent && (
              <>
                {/* Personal Information */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ borderBottom: '2px solid #1976d2', pb: 1, mb: 2, color: '#1976d2' }}>
                    PERSONAL INFORMATION
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Applicant ID:</strong> {selectedStudent?.studentData?.applicantId}</Typography>
                      <Typography><strong>Full Name:</strong> {selectedStudent?.studentData?.name}</Typography>
                      <Typography><strong>Email:</strong> {selectedStudent?.studentData?.email}</Typography>
                      <Typography><strong>Mobile:</strong> {selectedStudent?.studentData?.phone}</Typography>
                      <Typography><strong>Date of Birth:</strong> {selectedStudent?.studentData?.dob ? new Date(selectedStudent.studentData.dob).toLocaleDateString() : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Gender:</strong> {selectedStudent?.studentData?.gender}</Typography>
                      <Typography><strong>Category:</strong> {selectedStudent?.studentData?.category}</Typography>
                      <Typography><strong>Religion:</strong> {selectedStudent?.studentData?.religion}</Typography>
                      <Typography><strong>Differently Abled:</strong> {selectedStudent?.isDifferentlyAbled ? 'Yes' : 'No'}</Typography>
                      {selectedStudent?.isDifferentlyAbled === 'yes' && (
                        <Typography><strong>Disability Percentage:</strong> {selectedStudent?.differentlyAbledPercentage}%</Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>

                {/* Academic Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ borderBottom: '2px solid #1976d2', pb: 1, mb: 2, color: '#1976d2' }}>
                    ACADEMIC DETAILS
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Institution:</strong> {selectedStudent?.studentData?.institution}</Typography>
                      <Typography><strong>Course:</strong> {selectedStudent?.studentData?.courseName}</Typography>
                      <Typography><strong>Course Duration:</strong> {selectedStudent?.studentData?.courseDuration} Years</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Board:</strong> {selectedStudent?.studentData?.board}</Typography>
                      <Typography><strong>Roll Number:</strong> {selectedStudent?.studentData?.rollNo}</Typography>
                      <Typography><strong>Percentage:</strong> {selectedStudent?.studentData?.percentage}%</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Guardian Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ borderBottom: '2px solid #1976d2', pb: 1, mb: 2, color: '#1976d2' }}>
                    GUARDIAN DETAILS
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Guardian Name:</strong> {selectedStudent?.guardianDetails?.name}</Typography>
                      <Typography><strong>Relation:</strong> {selectedStudent?.guardianDetails?.relation}</Typography>
                      <Typography><strong>Occupation:</strong> {selectedStudent?.guardianDetails?.occupation}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Annual Income:</strong> ₹{selectedStudent?.guardianDetails?.annualIncome}</Typography>
                      <Typography><strong>Mobile:</strong> {selectedStudent?.guardianDetails?.mobile}</Typography>
                      <Typography><strong>Domiciled in WB:</strong> {selectedStudent?.guardianDetails?.domiciled ? 'Yes' : 'No'}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Address Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ borderBottom: '2px solid #1976d2', pb: 1, mb: 2, color: '#1976d2' }}>
                    ADDRESS DETAILS
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography><strong>Current Address:</strong> {selectedStudent?.address?.current}</Typography>
                      <Typography><strong>Permanent Address:</strong> {selectedStudent?.address?.permanent}</Typography>
                      <Typography><strong>District:</strong> {selectedStudent?.address?.district}</Typography>
                      <Typography><strong>State:</strong> {selectedStudent?.address?.state}</Typography>
                      <Typography><strong>PIN Code:</strong> {selectedStudent?.address?.pinCode}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Bank Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ borderBottom: '2px solid #1976d2', pb: 1, mb: 2, color: '#1976d2' }}>
                    BANK DETAILS
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Bank Name:</strong> {selectedStudent?.bankDetails?.bankName}</Typography>
                      <Typography><strong>Branch Name:</strong> {selectedStudent?.bankDetails?.branchName}</Typography>
                      <Typography><strong>IFSC Code:</strong> {selectedStudent?.bankDetails?.ifscCode}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Account Number:</strong> {selectedStudent?.bankDetails?.accountNo}</Typography>
                      <Typography><strong>Account Holder:</strong> {selectedStudent?.bankDetails?.accountHolderName}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Application Status */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ borderBottom: '2px solid #1976d2', pb: 1, mb: 2, color: '#1976d2' }}>
                    APPLICATION STATUS
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography><strong>Current Status:</strong> {' '}
                        <Chip 
                          label={selectedStudent.status}
                          color={selectedStudent.status === 'SANCTIONED' ? 'success' : 'primary'}
                          size="small"
                        />
                      </Typography>
                      <Typography><strong>Last Updated:</strong> {new Date(selectedStudent.lastUpdated).toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setOpenStudentDetailsDialog(false);
                setOpenStatusUpdateDialog(true);
              }}
            >
              Update Status
            </Button>
            <Button onClick={() => setOpenStudentDetailsDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Dialog */}
        {renderStatusUpdateDialog()}
      </Container>
    </>
  );
};

export default AdminDashboard;
