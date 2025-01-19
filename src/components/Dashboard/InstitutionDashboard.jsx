import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography,
  Box,
  Paper,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  Tooltip,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { 
  updateDoc,
  doc,
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  getDoc
} from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const db = getFirestore();
const storage = getStorage();

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDocuments, setOpenDocuments] = useState(false);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [openRemarkDialog, setOpenRemarkDialog] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [pendingStatus, setPendingStatus] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({
    status: null,
    studentId: null,
    remarks: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRejectedSanctioned, setShowRejectedSanctioned] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const loginId = sessionStorage.getItem('loginId');
    const userType = sessionStorage.getItem('userType');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');

    if (!isAuthenticated || !loginId || userType !== 'institution' || loginId !== 'HOILOG2569') {
      navigate('/admin-login');
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentsRef = collection(db, 'students');
        const q = query(
          studentsRef, 
          where('applicationSubmitted', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedStudents = [];
        
        querySnapshot.forEach((doc) => {
          fetchedStudents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setStudents(fetchedStudents);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch students data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.clear();
    // Navigate to login page
    navigate('/admin-login');
  };

  const handleViewDetails = async (student) => {
    try {
      const studentRef = doc(db, 'students', student.id);
      const studentDoc = await getDoc(studentRef);
      
      if (studentDoc.exists()) {
        const studentData = {
          id: studentDoc.id,
          ...studentDoc.data()
        };
        setSelectedStudent(studentData);
        setOpenDialog(true);

        if (studentData.documents) {
          setDocuments(studentData.documents);
        }
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError('Failed to fetch student details');
    }
  };

  const handleUpdateStatus = async (newStatus, statusRemarks = '', studentId) => {
    try {
      const studentRef = doc(db, 'students', studentId);
      const timestamp = new Date().toISOString();
      
      // Get current student data first
      const studentSnap = await getDoc(studentRef);
      if (!studentSnap.exists()) {
        throw new Error('Student document not found');
      }
      
      const currentData = studentSnap.data();
      console.log('Current student data:', currentData);

      // Start with current data to preserve all fields
      const updateData = {
        ...currentData,
        status: newStatus,
        lastUpdated: timestamp
      };

      // Add specific flags and messages based on status
      switch (newStatus) {
        case 'APPROVED':
          // Set the basic flags
          updateData.applicationApproved = true;
          updateData.applicationUnlocked = false;
          updateData.applicationRejected = false;
          updateData.forwardedToAdmin = true;
          updateData.statusMessage = 'APPLICATION APPROVED ! FORWARDED TO ADMINISTRATOR';
          updateData.remarks = statusRemarks || '';

          // Set root level fields based on existing data
          updateData.name = currentData.name || currentData.fullName || '';
          updateData.institutionName = currentData.institution || currentData.institutionName || '';
          updateData.email = currentData.email || '';
          updateData.phone = currentData.mobile || currentData.phone || '';
          updateData.applicationId = currentData.applicationId || '';

          // Ensure these fields exist at root level for AdminDashboard
          if (!updateData.name && currentData.personalInfo?.fullName) {
            updateData.name = currentData.personalInfo.fullName;
          }
          if (!updateData.institutionName && currentData.institutionInfo?.institutionName) {
            updateData.institutionName = currentData.institutionInfo.institutionName;
          }

          // Structure personal info
          updateData.personalInfo = {
            ...(currentData.personalInfo || {}),
            fullName: updateData.name,
            email: updateData.email,
            phone: updateData.phone || updateData.mobile,
            address: currentData.address || ''
          };

          // Structure institution info
          updateData.institutionInfo = {
            ...(currentData.institutionInfo || {}),
            institutionName: updateData.institutionName
          };

          // Preserve academic info if exists
          if (currentData.academicInfo) {
            updateData.academicInfo = currentData.academicInfo;
          }

          // Log the update for verification
          console.log('Updating student document with data:', {
            id: studentId,
            name: updateData.name,
            institutionName: updateData.institutionName,
            applicationId: updateData.applicationId,
            status: updateData.status,
            applicationApproved: updateData.applicationApproved,
            forwardedToAdmin: updateData.forwardedToAdmin
          });
          break;

        case 'UNLOCK_APPLICATION':
          updateData.applicationApproved = false;
          updateData.applicationUnlocked = true;
          updateData.applicationRejected = false;
          updateData.applicationSubmitted = false;
          updateData.forwardedToAdmin = false;
          updateData.statusMessage = 'APPLICATION UNLOCKED FOR EDITING';
          updateData.remarks = statusRemarks;
          break;

        case 'REJECTED':
          updateData.applicationApproved = false;
          updateData.applicationUnlocked = false;
          updateData.applicationRejected = true;
          updateData.forwardedToAdmin = false;
          updateData.statusMessage = 'APPLICATION REJECTED';
          updateData.remarks = statusRemarks;
          break;

        case 'SUBMITTED':
          updateData.applicationApproved = false;
          updateData.applicationUnlocked = false;
          updateData.applicationRejected = false;
          updateData.applicationSubmitted = true;
          updateData.forwardedToAdmin = false;
          updateData.statusMessage = 'Application under review';
          break;

        default:
          updateData.statusMessage = 'Application under review';
      }

      // Create status history entry
      const historyEntry = {
        date: timestamp,
        status: newStatus,
        statusMessage: updateData.statusMessage,
        remarks: statusRemarks || '',
        updatedBy: 'HOI'
      };

      // Get current history and add new entry
      const currentHistory = currentData.statusHistory || [];
      updateData.statusHistory = [...currentHistory, historyEntry];

      console.log('Updating student with data:', {
        id: studentId,
        name: updateData.name,
        institutionName: updateData.institutionName,
        applicationId: updateData.applicationId,
        status: updateData.status,
        applicationApproved: updateData.applicationApproved,
        forwardedToAdmin: updateData.forwardedToAdmin
      });

      await updateDoc(studentRef, updateData);
      
      // Verify the update
      const verifySnap = await getDoc(studentRef);
      console.log('Verified data after update:', verifySnap.data());
      
      // Update local state
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId 
            ? { ...student, ...updateData } 
            : student
        )
      );
      
      setOpenDialog(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status: ' + err.message);
    }
  };

  const handleViewDocuments = async (student) => {
    try {
      setSelectedStudent(student);
      
      // Get all submitted documents
      const submittedDocs = {};
      if (student.documents) {
        Object.entries(student.documents).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            submittedDocs[key] = value;
          }
        });
      }
      
      setDocuments(submittedDocs);
      setOpenDocuments(true);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'UNLOCK_APPLICATION':
        return 'warning';
      default:
        return 'info';
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'UNLOCK_APPLICATION' || newStatus === 'REJECTED') {
      setPendingStatus(newStatus);
      setOpenRemarkDialog(true);
    } else {
      handleStatusUpdateWithConfirmation(newStatus, selectedStudent.id);
    }
  };

  const handleRemarkSubmit = () => {
    if (remarks.trim()) {
      handleUpdateStatus(pendingStatus, remarks, selectedStudent.id);
      setOpenRemarkDialog(false);
      setRemarks('');
      setPendingStatus(null);
    }
  };

  const handleStatusUpdateWithConfirmation = (status, studentId, remarks = '') => {
    setConfirmationDetails({ status, studentId, remarks });
    setOpenConfirmDialog(true);
  };

  const handleConfirmStatusUpdate = () => {
    const { status, studentId, remarks } = confirmationDetails;
    handleUpdateStatus(status, remarks, studentId);
    setOpenConfirmDialog(false);
    setConfirmationDetails({ status: null, studentId: null, remarks: '' });
  };

  const handleCancelStatusUpdate = () => {
    setOpenConfirmDialog(false);
    setConfirmationDetails({ status: null, studentId: null, remarks: '' });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const studentsCollection = collection(db, 'students');
      const q = query(studentsCollection, 
        where('status', '!=', 'REJECTED')
      );
      const querySnapshot = await getDocs(q);
      const fetchedStudents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(fetchedStudents);
      
      setSearchQuery('');
      setFilterStatus('ALL');
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredStudents = students
    .filter(student => {
      const searchLower = searchQuery.toLowerCase();
      return (
        student.status !== 'REJECTED' &&
        (student.name?.toLowerCase().includes(searchLower) ||
        student.applicantId?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower)) &&
        (filterStatus === 'ALL' || student.status === filterStatus)
      );
    });

  const displayStudents = showRejectedSanctioned 
    ? students.filter(student => 
        student.status === 'REJECTED' || student.status === 'SANCTIONED'
      ) 
    : filteredStudents;

  return (
    <div className="min-h-screen bg-gray-100">
      <AppBar position="fixed" className="bg-indigo-900">
        <Toolbar className="px-4">
          <DashboardIcon className="mr-3" />
          <Typography variant="h6" className="flex-grow font-semibold">
            VikasPath Scholarship HOI Dashboard
          </Typography>
          <div className="flex items-center space-x-4">
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileClick}
                size="small"
                className="ml-2"
              >
                <Avatar className="bg-indigo-700">
                  <PersonIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                size="small"
                className="ml-2"
                sx={{ color: 'white' }}
              >
                <RefreshIcon sx={{ color: 'white' }} />
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        className="mt-2"
      >
        <MenuItem>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" className="text-red-500" />
          </ListItemIcon>
          <span className="text-red-500">Logout</span>
        </MenuItem>
      </Menu>

      <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography variant="h6">
              {showRejectedSanctioned 
                ? 'Rejected & Sanctioned Students' 
                : 'Student Applications'}
            </Typography>
            <Box>
              <Button
                variant="contained"
                color={showRejectedSanctioned ? 'secondary' : 'primary'}
                onClick={() => setShowRejectedSanctioned(!showRejectedSanctioned)}
                sx={{ 
                  mr: 2,
                  textTransform: 'none'
                }}
              >
                {showRejectedSanctioned 
                  ? 'Back to All Students' 
                  : 'View Rejected & Sanctioned Students'}
              </Button>
              <TextField
                placeholder="Search applications..."
                variant="outlined"
                size="small"
                className="min-w-[300px]"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FormControl size="small" className="min-w-[150px]">
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  startAdornment={
                    <FilterListIcon className="ml-2 text-gray-400" />
                  }
                >
                  <MenuItem value="ALL">All Applications</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                  <MenuItem value="UNLOCK_APPLICATION">Unlock Request</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {error ? (
            <Alert severity="error">
              {error}
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayStudents.map((student) => (
                    <tr 
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                      style={{ 
                        backgroundColor: 
                          student.status === 'REJECTED' ? '#ffebee' : 
                          student.status === 'SANCTIONED' ? '#e8f5e9' : 
                          'transparent' 
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {student.applicantId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {student.courseName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          label={student.status || 'SUBMITTED'}
                          color={getStatusColor(student.status)}
                          className="font-medium"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(student)}
                          className="bg-indigo-900 hover:bg-indigo-800"
                          sx={{
                            minWidth: '100px',
                            py: 0.5,
                            fontSize: '0.75rem'
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDocuments(student)}
                          className="bg-indigo-900 hover:bg-indigo-800"
                          sx={{
                            minWidth: '120px',
                            py: 0.5,
                            fontSize: '0.75rem'
                          }}
                        >
                          View Documents
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Paper>
      </Container>

      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setSelectedStudent(null);
          setDocuments({});
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        {selectedStudent && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: '#1a237e', 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2
            }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Student Application Details
                </Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  Application ID: {selectedStudent.applicantId}
                </Typography>
              </Box>
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={selectedStudent.status || 'SUBMITTED'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  sx={{ 
                    backgroundColor: 'white',
                    '& .MuiSelect-select': { py: 1 }
                  }}
                >
                  <MenuItem value="SUBMITTED">SUBMITTED</MenuItem>
                  <MenuItem value="APPROVED">APPROVED</MenuItem>
                  <MenuItem value="UNLOCK_APPLICATION">UNLOCK_APPLICATION</MenuItem>
                  <MenuItem value="REJECTED">REJECTED</MenuItem>
                </Select>
              </FormControl>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <StudentDetailsSection 
                  title="BASIC DETAILS" 
                  data={selectedStudent}
                />

                <StudentDetailsSection 
                  title="DETAILS OF THE QUALIFYING PUBLIC EXAMINATION" 
                  data={selectedStudent}
                />

                <StudentDetailsSection 
                  title="PRESENT COURSE OF STUDY" 
                  data={selectedStudent}
                />

                <StudentDetailsSection 
                  title="GUARDIAN DETAILS" 
                  data={selectedStudent}
                />

                <StudentDetailsSection 
                  title="ADDRESS DETAILS" 
                  data={selectedStudent}
                />

                <StudentDetailsSection 
                  title="BANK DETAILS" 
                  data={selectedStudent}
                />

                <StudentDetailsSection 
                  title="DOCUMENTS" 
                  data={selectedStudent}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Button 
                onClick={() => {
                  setOpenDialog(false);
                  setSelectedStudent(null);
                  setDocuments({});
                }}
                variant="outlined"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={openRemarkDialog}
        onClose={() => {
          setOpenRemarkDialog(false);
          setPendingStatus(null);
          setRemarks('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#1a237e', color: 'white' }}>
          {pendingStatus === 'UNLOCK_APPLICATION' ? 'Reason for Unlocking' : 'Reason for Rejection'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Enter Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required
            error={remarks.trim() === ''}
            helperText={remarks.trim() === '' ? 'Remarks are required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenRemarkDialog(false);
              setPendingStatus(null);
              setRemarks('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRemarkSubmit}
            variant="contained"
            disabled={remarks.trim() === ''}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelStatusUpdate}
        aria-labelledby="status-update-confirmation-dialog"
      >
        <DialogTitle id="status-update-confirmation-dialog">
          Confirm Status Update
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to update the application status to {confirmationDetails.status}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusUpdate} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStatusUpdate} 
            color="primary" 
            variant="contained" 
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <DocumentViewerDialog 
        open={openDocuments}
        onClose={() => setOpenDocuments(false)}
        documents={documents}
        studentData={selectedStudent}
      />

      {/* Footer */}
      <Box 
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1a237e',
          color: 'white',
          textAlign: 'center',
          py: 2,
          px: 3,
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Typography 
          variant="body2" 
          color="inherit"
          sx={{
            fontSize: {
              xs: '0.75rem',  
              sm: '0.875rem', 
              md: '1rem'      
            }
          }}
        >
          Copyright 2025 Higher Education - All Rights Reserved
        </Typography>
      </Box>
    </div>
  );
};

const StudentDetailsSection = ({ title, data }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);

  const getValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc ? acc[part] : null, obj);
  };

  const sections = {
    'BASIC DETAILS': {
      'Applicant Registration No.': 'applicantId',
      'Applicant Name': 'name',
      'Mobile No.': 'mobile',
      'Email Id': 'email',
      'Date of Birth': 'dateOfBirth',
      'Roll Number of 10th Standard': 'rollNo',
      'Passing Year': 'year'
    },
    'DETAILS OF THE QUALIFYING PUBLIC EXAMINATION': {
      'Name of the examination': 'qualifyingExam',
      'Board/Council': 'board',
      'Roll No.': 'rollNo',
      'Percentage(%)': 'percentage'
    },
    'PRESENT COURSE OF STUDY': {
      'Name of the course': 'courseName',
      'Duration of Course (In years)': 'courseDuration',
      'Institution': 'institution'
    },
    'GUARDIAN DETAILS': {
      'Guardian Name': 'guardianDetails.name',
      'Relation': 'guardianDetails.relation',
      'Occupation': 'guardianDetails.occupation',
      'Annual Income': (data) => `₹${getValue(data, 'guardianDetails.annualIncome') || 0}`,
      'Domiciled in West Bengal': 'guardianDetails.domiciled'
    },
    'ADDRESS DETAILS': {
      'Current Address': 'address.current',
      'Permanent Address': 'address.permanent',
      'House No.': 'address.houseNo',
      'Street Name': 'address.streetName',
      'Town/Village': 'address.townVillage',
      'PIN Code': 'address.pinCode',
      'State': 'address.state',
      'District': 'address.district'
    },
    'BANK DETAILS': {
      'Bank Name': 'bankDetails.bankName',
      'IFSC Code': 'bankDetails.ifscCode',
      'Account Number': 'bankDetails.accountNo'
    },
    'DOCUMENTS': {
      'Applicant Image': { type: 'image', path: 'documents.applicantImage' },
      'Applicant Signature': { type: 'image', path: 'documents.applicantSignature' },
      'HS Marksheet': { type: 'image', path: 'documents.hsMarksheet' },
      'Madhyamik Admit': { type: 'image', path: 'documents.madhyamikAdmit' },
      'Admission Receipt': { type: 'image', path: 'documents.admissionReceipt' },
      'Bank Passbook': { type: 'image', path: 'documents.bankPassbook' },
      'Aadhar Card': { type: 'image', path: 'documents.aadharCard' },
      'Caste Certificate': { type: 'image', path: 'documents.casteCertificate' },
      'Income Certificate': { type: 'image', path: 'documents.incomeCertificate' }
    }
  };

  const renderValue = (key, value) => {
    if (typeof value === 'object' && value.type === 'image') {
      const imageData = getValue(data, value.path);
      return imageData ? (
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSelectedDocument(imageData);
            setOpenImageDialog(true);
          }}
          sx={{ mt: 1 }}
        >
          View Document
        </Button>
      ) : 'Not uploaded';
    }

    const displayValue = typeof value === 'function' ? value(data) : getValue(data, value);
    return displayValue || 'Not provided';
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 600 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(sections[title] || {}).map(([key, value]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              height: '100%'
            }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {key}
              </Typography>
              <Typography variant="body1">
                {renderValue(key, value)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <DocumentViewerDialog />
    </Box>
  );
};

const DocumentViewerDialog = ({ open, onClose, documents = {}, studentData }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewerKey, setViewerKey] = useState(0);

  const submittedDocTypes = Object.keys(documents).reduce((acc, key) => {
    if (documents[key] && documents[key].trim() !== '') {
      acc[key] = {
        'applicantImage': 'Applicant Image',
        'applicantSignature': 'Applicant Signature',
        'hsMarksheet': 'HS Marksheet',
        'madhyamikAdmit': 'Madhyamik Admit',
        'admissionReceipt': 'Admission Receipt',
        'bankPassbook': 'Bank Passbook',
        'aadharCard': 'Aadhar Card',
        'casteCertificate': 'Caste Certificate',
        'incomeCertificate': 'Income Certificate'
      }[key];
    }
    return acc;
  }, {});

  const handleViewDocument = (docData, docName) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${docName} - ${studentData?.name || 'Student'}</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f0f0f0;
                font-family: Arial, sans-serif;
              }
              .container {
                max-width: 100%;
                max-height: 100vh;
                overflow: auto;
                background: white;
                padding: 20px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              .header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #1a237e;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 1000;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
              .header-info {
                display: flex;
                flex-direction: column;
                gap: 5px;
              }
              .header-title {
                font-size: 1.2em;
                font-weight: bold;
                margin: 0;
              }
              .header-subtitle {
                font-size: 0.9em;
                opacity: 0.9;
                margin: 0;
              }
              .content {
                margin-top: 80px;
                text-align: center;
                padding: 20px;
              }
              img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 0 auto;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-info">
                <p class="header-title">${docName}</p>
                <p class="header-subtitle">Student: ${studentData?.name || 'N/A'}</p>
              </div>
            </div>
            <div class="container">
              <div class="content">
                <img src="${docData}" alt="${docName}" />
              </div>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '90vh' }
      }}
    >
      {selectedDoc ? (
        <DialogTitle sx={{ 
          backgroundColor: '#1a237e', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Submitted Documents
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Student: {studentData?.name} (ID: {studentData?.applicantId})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Current Status
              </Typography>
              <Chip
                label={studentData?.status || 'SUBMITTED'}
                color={getStatusColor(studentData?.status)}
                sx={{ 
                  fontWeight: 'medium',
                  minWidth: 100,
                  '& .MuiChip-label': {
                    px: 2
                  }
                }}
              />
            </Box>
            <Button 
              onClick={onClose}
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
      ) : (
        <DialogTitle sx={{ 
          backgroundColor: '#1a237e', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Submitted Documents
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Student: {studentData?.name} (ID: {studentData?.applicantId})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Current Status
              </Typography>
              <Chip
                label={studentData?.status || 'SUBMITTED'}
                color={getStatusColor(studentData?.status)}
                sx={{ 
                  fontWeight: 'medium',
                  minWidth: 100,
                  '& .MuiChip-label': {
                    px: 2
                  }
                }}
              />
            </Box>
            <Button 
              onClick={onClose}
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
      )}
      <DialogContent sx={{ p: 3, display: 'flex', gap: 3 }}>
        {Object.keys(submittedDocTypes).length === 0 ? (
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4
          }}>
            <Typography variant="h6" color="text.secondary">
              No documents have been submitted yet
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ width: '300px', flexShrink: 0 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Submitted Documents List
              </Typography>
              <Paper elevation={2} sx={{ p: 2 }}>
                {Object.entries(submittedDocTypes).map(([docType, displayName]) => {
                  const documentData = documents[docType];
                  const isSelected = selectedDoc?.type === docType;

                  return (
                    <Box
                      key={docType}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'primary.light' : 'background.paper',
                        color: isSelected ? 'white' : 'text.primary',
                        '&:hover': {
                          backgroundColor: isSelected ? 'primary.light' : 'action.hover'
                        },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: isSelected ? '1px solid primary.main' : '1px solid #eee'
                      }}
                      onClick={() => {
                        setSelectedDoc({ type: docType, data: documentData, name: displayName });
                        setViewerKey(prev => prev + 1);
                      }}
                    >
                      <Typography variant="subtitle2">
                        {displayName}
                      </Typography>
                      <Chip 
                        size="small"
                        label="View"
                        color="primary"
                        sx={{ height: 24 }}
                      />
                    </Box>
                  );
                })}
              </Paper>
            </Box>

            <Box sx={{ flex: 1 }}>
              {!selectedDoc ? (
                <Box 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    p: 4
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Select a document to view
                  </Typography>
                </Box>
              ) : (
                <Paper 
                  key={viewerKey}
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ 
                    p: 2,
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" color="primary">
                      {selectedDoc.name}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDocument(selectedDoc.data, selectedDoc.name)}
                    >
                      Open Full Screen
                    </Button>
                  </Box>
                  <Box sx={{ 
                    flex: 1,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f8f8f8',
                    overflow: 'auto'
                  }}>
                    <img 
                      src={selectedDoc.data} 
                      alt={selectedDoc.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: 'calc(90vh - 200px)',
                        objectFit: 'contain',
                        borderRadius: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  </Box>
                </Paper>
              )}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'UNLOCK_APPLICATION':
      return 'warning';
    default:
      return 'info';
  }
};

export default InstitutionDashboard;
