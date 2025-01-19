import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  IconButton,
  Grid,
  CircularProgress,
  Container,
  AppBar,
  Toolbar,
  TablePagination,
  Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  orderBy, 
  limit, 
  startAfter, 
  startAt, 
  endAt, 
  endBefore 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import ApplicationForm from './ApplicationForm';
import ViewApplication from './ViewApplication';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  'SUBMITTED': {
    color: '#1976d2',
    background: '#e3f2fd',
    textColor: '#fff',
    label: 'Application Submitted'
  },
  'PENDING': {
    color: '#ed6c02',
    background: '#fff4e5',
    textColor: '#fff',
    label: 'Application Pending'
  },
  'UNDER_REVIEW': {
    color: '#9c27b0',
    background: '#f3e5f5',
    textColor: '#fff',
    label: 'Under Review'
  },
  'APPROVED': {
    color: '#2e7d32',
    background: '#edf7ed',
    textColor: '#fff',
    label: 'APPLICATION APPROVED ! FORWARDED TO ADMINISTRATOR'
  },
  'REJECTED': {
    color: '#d32f2f',
    background: '#fdeded',
    textColor: '#fff',
    label: 'Application Rejected'
  },
  'UNLOCK_APPLICATION': {
    color: '#ed6c02',
    background: '#fff4e5',
    textColor: '#fff',
    label: 'APPLICATION UNLOCKED FOR EDITING'
  },
  'SANCTIONED': {
    color: '#2e7d32',
    background: '#edf7ed',
    textColor: '#fff',
    label: 'Scholarship Sanctioned'
  }
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [openTrackingDialog, setOpenTrackingDialog] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const navigate = useNavigate();
  const { currentUser, signOutUser } = useAuth();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          const data = studentDoc.data();
          
          // Get existing status history or initialize new array
          let history = data.statusHistory || [];

          // Add new status if not already in history
          const addStatus = (newStatus) => {
            const exists = history.some(
              h => h.status === newStatus.status && 
              new Date(h.date).getTime() === new Date(newStatus.date).getTime()
            );
            if (!exists) {
              history.push(newStatus);
            }
          };

          // 1. Initial Application Submission
          if (data.applicationSubmitted) {
            addStatus({
              date: data.applicationDate || data.createdAt || new Date().toISOString(),
              by: 'Student',
              status: 'SUBMITTED',
              statusMessage: 'Application Submitted',
              remarks: 'Initial application submission'
            });
          }

          // 2. HOI Review Started
          if (data.reviewStartedAt) {
            addStatus({
              date: data.reviewStartedAt,
              by: 'HOI',
              status: 'UNDER_REVIEW',
              statusMessage: 'Under Review',
              remarks: 'Application review started by Head of Institution'
            });
          }

          // 3. Application Unlocked
          if (data.applicationUnlocked) {
            addStatus({
              date: data.applicationUnlockedAt || new Date().toISOString(),
              by: 'HOI',
              status: 'UNLOCK_APPLICATION',
              statusMessage: 'Application Unlocked for Editing',
              remarks: data.unlockRemarks || 'Additional information or corrections required'
            });
          }

          // 4. Student Resubmission
          if (data.applicationUpdatedAt && data.applicationUnlocked) {
            addStatus({
              date: data.applicationUpdatedAt,
              by: 'Student',
              status: 'SUBMITTED',
              statusMessage: 'Application Resubmitted',
              remarks: 'Updated application submitted after corrections'
            });
          }

          // 5. HOI Re-Review
          if (data.reReviewStartedAt) {
            addStatus({
              date: data.reReviewStartedAt,
              by: 'HOI',
              status: 'UNDER_REVIEW',
              statusMessage: 'Under Review',
              remarks: 'Application under review after resubmission'
            });
          }

          // 6. HOI Decision
          if (data.status === 'APPROVED') {
            addStatus({
              date: data.approvedAt || data.lastUpdated || new Date().toISOString(),
              by: 'HOI',
              status: 'APPROVED',
              statusMessage: 'Application Approved & Forwarded to Administration',
              remarks: data.approvalRemarks || 'Application has been approved by HOI'
            });
          } else if (data.status === 'REJECTED') {
            addStatus({
              date: data.rejectedAt || data.lastUpdated || new Date().toISOString(),
              by: 'HOI',
              status: 'REJECTED',
              statusMessage: 'Application Rejected',
              remarks: data.rejectionRemarks || 'Application has been rejected'
            });
          }

          // 7. HOA Review
          if (data.hoaReviewStartedAt) {
            addStatus({
              date: data.hoaReviewStartedAt,
              by: 'HOA',
              status: 'UNDER_REVIEW',
              statusMessage: 'Under HOA Review',
              remarks: 'Application under review by Head of Administration'
            });
          }

          // 8. Sanction Status
          if (data.status === 'SANCTIONED') {
            addStatus({
              date: data.sanctionedAt || data.lastUpdated || new Date().toISOString(),
              by: 'HOA',
              status: 'SANCTIONED',
              statusMessage: 'Scholarship Sanctioned',
              remarks: data.sanctionRemarks || 'Scholarship has been sanctioned and will be disbursed'
            });
          }

          // Sort history by date in ascending order (oldest first)
          history = history.sort((a, b) => new Date(a.date) - new Date(b.date));

          // Store the complete history in Firestore
          await updateDoc(doc(db, 'students', studentDoc.id), {
            statusHistory: history
          });

          setStatusHistory(history);
          setStudentData({
            ...data,
            statusHistory: history
          });
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('email', '==', currentUser.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const data = studentDoc.data();
        setStudentData(data);
        
        // Update status history if needed
        const history = [];
        
        // Initial Application Submission
        if (data.createdAt) {
          history.push({
            date: data.createdAt,
            by: 'STUDENT',
            status: 'SUBMITTED',
            statusMessage: 'APPLICATION SUBMITTED',
            remarks: 'Initial application submission'
          });
        }

        // Add status updates
        if (data.status === 'APPROVED') {
          history.push({
            date: data.lastUpdated || new Date().toISOString(),
            by: 'HOI',
            status: 'APPROVED',
            statusMessage: 'APPLICATION APPROVED. FORWARDED TO ADMINISTRATION',
            remarks: data.remarks || 'Application approved by institution'
          });
        } else if (data.status === 'REJECTED') {
          history.push({
            date: data.lastUpdated || new Date().toISOString(),
            by: 'HOI',
            status: 'REJECTED',
            statusMessage: 'Application Rejected',
            remarks: data.rejectionRemarks || 'Application could not be processed'
          });
        } else if (data.status === 'SANCTIONED') {
          history.push({
            date: data.sanctionedAt || new Date().toISOString(),
            by: 'HOA',
            status: 'SANCTIONED',
            statusMessage: 'Application Sanctioned',
            remarks: 'Scholarship Money Distributed'
          });
        }

        setStatusHistory(history);
        setError(null);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusDisplay = () => {
    if (!studentData) return null;

    const getStatusChip = () => {
      switch (studentData.status) {
        case 'APPROVED':
          return (
            <Chip
              label="APPLICATION APPROVED. FORWARDED TO ADMINISTRATION"
              color="success"
              sx={{ 
                fontWeight: 'medium',
                backgroundColor: '#2e7d32 !important',
                color: '#fff !important',
                '& .MuiChip-label': { px: 2 }
              }}
            />
          );
        case 'REJECTED':
          return <Chip label="Application Rejected" color="error" />;
        case 'SANCTIONED':
          return <Chip label="Scholarship Sanctioned" color="success" />;
        case 'PENDING':
          return <Chip label="Application Pending" color="warning" />;
        default:
          return <Chip label="Application Submitted" color="primary" />;
      }
    };

    let statusColor = 'info';
    let statusIcon = null;

    switch (studentData.status) {
      case 'APPROVED':
        statusColor = 'success';
        statusIcon = <VisibilityIcon />;
        break;
      case 'REJECTED':
        statusColor = 'error';
        statusIcon = <CloseIcon />;
        break;
      case 'UNLOCK_APPLICATION':
        statusColor = 'warning';
        statusIcon = <RefreshIcon />;
        break;
      case 'SANCTIONED':
        statusColor = 'success';
        statusIcon = <VisibilityIcon />;
        break;
      default:
        statusIcon = <PersonIcon />;
    }

    return (
      <Box sx={{ mt: 3, mb: 4 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 3,
            backgroundColor: statusColor === 'error' ? '#fdeded' : 
                           statusColor === 'success' ? '#edf7ed' :
                           statusColor === 'warning' ? '#fff4e5' : '#e5f6fd'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {statusIcon}
            <Typography variant="h6" component="div" color={`${statusColor}.main`}>
              {getStatusChip()}
            </Typography>
          </Box>
          
          {studentData.remarks && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Remarks from Institution:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  p: 2,
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {studentData.remarks}
              </Typography>
            </Box>
          )}

          {studentData.status === 'UNLOCK_APPLICATION' && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsFormOpen(true)}
                startIcon={<RefreshIcon />}
              >
                Edit Application
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderStatusSection = () => {
    if (!studentData || !studentData.createdAt) return null;

    // Calculate the current page's data
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPageData = statusHistory.slice(startIndex, endIndex);

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    return (
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="contained" 
          size="small"
          onClick={() => {
            setPage(0);
            setOpenStatusDialog(true);
          }}
          startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
          sx={{ 
            textTransform: 'none',
            mb: 2,
            fontWeight: 500,
            background: '#34495e',
            borderRadius: '4px',
            padding: '4px 12px',
            fontSize: '0.813rem',
            height: '32px',
            boxShadow: '0 0 5px rgba(52, 73, 94, 0.3), 0 0 10px rgba(52, 73, 94, 0.2)',
            '&:hover': {
              background: '#2c3e50',
              boxShadow: '0 0 8px rgba(52, 73, 94, 0.4), 0 0 15px rgba(52, 73, 94, 0.3)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Track Application Status
        </Button>

        <Dialog 
          open={openStatusDialog} 
          onClose={() => setOpenStatusDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 0,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: '#34495e',
              color: 'white',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 1.5,
              px: 2,
              minHeight: '48px'
            }}
          >
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
              Application Status Tracking
            </Typography>
            <IconButton 
              onClick={() => setOpenStatusDialog(false)} 
              sx={{ 
                color: 'white',
                padding: '4px',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)'
                } 
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0, bgcolor: '#fff' }}>
            {/* Entries and Search Section */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #dee2e6'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>Show</Typography>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>entries</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>Search:</Typography>
                <input
                  type="text"
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    width: '200px'
                  }}
                />
              </Box>
            </Box>

            {/* Table Section */}
            <TableContainer sx={{ borderBottom: '1px solid #dee2e6' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        bgcolor: '#fff',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '0.875rem',
                        color: '#333',
                        py: 1.5,
                        px: 2
                      }}
                    >
                      SL. NO.
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        bgcolor: '#fff',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '0.875rem',
                        color: '#333',
                        py: 1.5,
                        px: 2
                      }}
                    >
                      DATE & TIME
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        bgcolor: '#fff',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '0.875rem',
                        color: '#333',
                        py: 1.5,
                        px: 2
                      }}
                    >
                      STATUS
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        bgcolor: '#fff',
                        borderBottom: '2px solid #dee2e6',
                        fontSize: '0.875rem',
                        color: '#333',
                        py: 1.5,
                        px: 2
                      }}
                    >
                      REMARKS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPageData.map((status, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.875rem' }}>
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.875rem' }}>
                        {new Date(status.date).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.875rem' }}>
                        {status.statusMessage}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.875rem' }}>
                        {status.remarks}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Section */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: '#fff'
            }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#666' }}>
                Showing {startIndex + 1} to {Math.min(endIndex, statusHistory.length)} of {statusHistory.length} entries
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  sx={{ 
                    fontSize: '0.875rem',
                    color: '#666',
                    bgcolor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    '&:hover': { bgcolor: '#e9ecef' },
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  Previous
                </Button>
                <Button 
                  sx={{ 
                    fontSize: '0.875rem',
                    color: '#fff',
                    bgcolor: '#007bff',
                    '&:hover': { bgcolor: '#0056b3' },
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  1
                </Button>
                <Button 
                  disabled={endIndex >= statusHistory.length}
                  onClick={() => setPage(page + 1)}
                  sx={{ 
                    fontSize: '0.875rem',
                    color: '#666',
                    bgcolor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    '&:hover': { bgcolor: '#e9ecef' },
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    );
  };

  // Show loading first
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Then check for errors
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <AppBar position="fixed" sx={{ width: '100%', left: 0 }}>
        <Toolbar sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/wb.png" 
              alt="VikasPath Logo" 
              style={{ height: 40, marginRight: 16 }} 
            />
            <Typography variant="h6">
              Student Dashboard
            </Typography>
          </Box>
          <Box>
            <Button color="inherit" onClick={handleLogout}>
              Logout
              <LogoutIcon sx={{ ml: 1 }} />
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth={false} 
        disableGutters 
        sx={{ 
          flexGrow: 1, 
          mt: '64px', // AppBar height
          px: { xs: 1, sm: 2, md: 3 },
          width: '100%' 
        }}
      >
        {/* Student Info Card */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <Avatar 
                src={studentData?.documents?.applicantImage || '/default-avatar.png'} 
                alt={studentData?.name}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {studentData?.name || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Applicant ID
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {studentData?.applicantId || 'Not Available'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {studentData?.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mobile Number
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {studentData?.mobile || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Current Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={
                        studentData?.applicationUnlocked ? 'Application Unlocked' :
                        studentData?.status === 'APPROVED' ? 'Application Approved' :
                        studentData?.status === 'REJECTED' ? 'Application Rejected' :
                        studentData?.status === 'SANCTIONED' ? 'Scholarship Sanctioned' :
                        studentData?.applicationSubmitted ? 'Application Submitted' :
                        'Application Pending'
                      }
                      color={
                        studentData?.applicationUnlocked ? 'warning' :
                        studentData?.status === 'APPROVED' ? 'success' :
                        studentData?.status === 'REJECTED' ? 'error' :
                        studentData?.status === 'SANCTIONED' ? 'success' :
                        studentData?.applicationSubmitted ? 'primary' :
                        'warning'
                      }
                      sx={{ 
                        fontWeight: 'medium',
                        backgroundColor: 
                          studentData?.applicationUnlocked ? '#ed6c02 !important' :
                          studentData?.status === 'APPROVED' ? '#2e7d32 !important' :
                          studentData?.status === 'REJECTED' ? '#d32f2f !important' :
                          studentData?.status === 'SANCTIONED' ? '#2e7d32 !important' :
                          studentData?.applicationSubmitted ? '#1976d2 !important' :
                          '#ed6c02 !important',
                        color: '#fff !important',
                        '& .MuiChip-label': { px: 2 }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Application Status Card */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Application Status
          </Typography>
          <Chip
            label={
              studentData?.applicationUnlocked ? 'Application Unlocked' :
              studentData?.status === 'APPROVED' ? 'Application Approved' :
              studentData?.status === 'REJECTED' ? 'Application Rejected' :
              studentData?.status === 'SANCTIONED' ? 'Scholarship Sanctioned' :
              studentData?.applicationSubmitted ? 'Application Submitted' :
              'Application Pending'
            }
            color={
              studentData?.applicationUnlocked ? 'warning' :
              studentData?.status === 'APPROVED' ? 'success' :
              studentData?.status === 'REJECTED' ? 'error' :
              studentData?.status === 'SANCTIONED' ? 'success' :
              studentData?.applicationSubmitted ? 'primary' :
              'warning'
            }
            sx={{ 
              fontWeight: 'bold',
              backgroundColor: 
                studentData?.applicationUnlocked ? '#ed6c02 !important' :
                studentData?.status === 'APPROVED' ? '#2e7d32 !important' :
                studentData?.status === 'REJECTED' ? '#d32f2f !important' :
                studentData?.status === 'SANCTIONED' ? '#2e7d32 !important' :
                studentData?.applicationSubmitted ? '#1976d2 !important' :
                '#ed6c02 !important',
              color: '#fff !important',
              '& .MuiChip-label': { px: 2 }
            }}
          />
        </Box>

        {renderStatusSection()}

        {/* Application Actions */}
        <Grid container spacing={3}>
          {studentData?.applicationSubmitted ? (
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    View Application
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Review the details of your submitted scholarship application
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setIsViewOpen(true)}
                >
                  View Details
                </Button>
              </Paper>
            </Grid>
          ) : !studentData?.applicationUnlocked ? (
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Start Your Scholarship Application
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Begin your scholarship application process
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setIsFormOpen(true)}
                >
                  Start Application
                </Button>
              </Paper>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    EDIT YOUR APPLICATION
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    You can now modify your previously submitted application
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setIsFormOpen(true)}
                >
                  Edit Application
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Application Form Dialog */}
        {isFormOpen && (
          <ApplicationForm
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            applicationData={studentData}
            studentData={studentData}
            readOnly={studentData?.applicationSubmitted && !studentData?.applicationUnlocked}
            isNewApplication={studentData?.applicationRejected}
          />
        )}

        {/* View Application Dialog */}
        {isViewOpen && (
          <ViewApplication
            open={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            applicationData={studentData}
            readOnly={true}
          />
        )}
      </Container>

      <Box 
        component="footer" 
        sx={{ 
          width: '100%', 
          backgroundColor: 'primary.main', 
          color: 'white', 
          textAlign: 'center', 
          py: 2 
        }}
      >
        <Typography variant="body2">
          &copy; 2025 VikasPath Scholarship - All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
