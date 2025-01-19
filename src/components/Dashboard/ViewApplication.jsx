import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  IconButton,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Download as DownloadIcon, Close as CloseIcon, Visibility as VisibilityIcon, Print as PrintIcon } from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ApplicationPDF from './ApplicationPDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const DocumentSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3)
}));

const ViewApplication = ({ open, onClose, applicationData }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const componentRef = useRef();

  // Check if all documents are uploaded
  const checkAllDocumentsUploaded = () => {
    const requiredDocs = [
      'aadharCard',
      'admissionReceipt',
      'applicantImage',
      'applicantSignature',
      'bankPassbook',
      'casteCertificate',
      'hsMarksheet',
      'incomeCertificate',
      'madhyamikAdmit'
    ];

    return requiredDocs.every(doc => applicationData?.documents?.[doc]);
  };

  const generatePDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let yPos = margin;

    // Add logo
    const logoWidth = 25;
    const logoHeight = 25;
    pdf.addImage('/wb.png', 'PNG', margin, yPos, logoWidth, logoHeight);

    // Add title
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VikasPath Scholarship, 2024-25', margin + logoWidth + 5, yPos + 5);
    pdf.text('Application Form', margin + logoWidth + 5, yPos + 11);
    yPos += 35;

    // Helper function to create section header
    const createSectionHeader = (title) => {
      pdf.setFillColor(65, 105, 225); // Royal Blue
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
      pdf.text(title, margin + 2, yPos + 5);
      yPos += 7;
    };

    // Helper function to add field row
    const addFieldRow = (label, value, height = 7) => {
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${label}${value ? ': ' + value : ''}`, margin + 2, yPos + 5);
      yPos += height;

      // Add new page if needed
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = margin;
      }
    };

    // Add student photo if available
    if (applicationData?.documents?.applicantImage) {
      const photoWidth = 30;
      const photoHeight = 35;
      const photoX = pageWidth - margin - photoWidth - 5;
      const photoY = yPos;
      pdf.addImage(applicationData.documents.applicantImage, 'JPEG', photoX, photoY, photoWidth, photoHeight);
    }

    // Basic Details Section
    createSectionHeader('Basic Details');

    addFieldRow('Applicant Registration No.', applicationData?.applicantId);
    addFieldRow('Applicant Name', applicationData?.name);
    addFieldRow('Mobile No.', applicationData?.mobile);
    addFieldRow('Email Id', applicationData?.email);
    addFieldRow('Roll Number of 10th Standard Board/Council', applicationData?.rollNo);
    addFieldRow('Passing Year of 10th Standard Board/Council', applicationData?.year);
    yPos += 3;

    // Details of qualifying examination
    createSectionHeader('Details of the qualifying public examination, eligible for scholarship');
    addFieldRow('Name of the examination', applicationData?.qualifyingExam);
    addFieldRow('Year of the examination', '2024');
    addFieldRow('Name of the Board/Council/University', applicationData?.board);
    addFieldRow('Roll No. of the Board/Council/University Exam', applicationData?.rollNo);
    addFieldRow('Total marks obtained', applicationData?.totalMarks);
    addFieldRow('Out Of', '240');
    addFieldRow('Overall percentage obtained(%)', applicationData?.percentage);
    yPos += 3;

    // Present Course of Study
    createSectionHeader('Present Course of Study');
    addFieldRow('Name of the course', applicationData?.courseName);
    addFieldRow('Duration of Course (In years)', applicationData?.courseDuration);
    addFieldRow('Name of the present Institution', applicationData?.institution);
    addFieldRow('District of Institution', applicationData?.address?.district);
    yPos += 3;

    // Personal Details (moved to first page)
    createSectionHeader('Personal Details');
    addFieldRow('Name of Father', applicationData?.guardianDetails?.name);
    addFieldRow('Profession of Father', applicationData?.guardianDetails?.occupation);
    addFieldRow('Name of Guardian', applicationData?.guardianDetails?.name);
    addFieldRow('Religion', applicationData?.religion);
    addFieldRow('Sex', applicationData?.gender);
    addFieldRow('Caste', applicationData?.caste);
    addFieldRow('Whether Differently Able', applicationData?.isDifferentlyAbled ? 'Yes' : 'No');
    addFieldRow('Whether the applicant is domiciled in West Bengal', applicationData?.isDomiciled ? 'Yes' : 'No');
    yPos += 3;

    // Add new page for remaining sections
    pdf.addPage();
    yPos = margin;

    // Present Family Address
    createSectionHeader('Present Family address');
    addFieldRow('House No', applicationData?.address?.houseNo);
    addFieldRow('Street Name', applicationData?.address?.streetName);
    addFieldRow('Town/Village', applicationData?.address?.townVillage);
    addFieldRow('PIN Code', applicationData?.address?.pinCode);
    addFieldRow('District', applicationData?.address?.district);
    addFieldRow('State', applicationData?.address?.state);
    yPos += 3;

    // Bank Details
    createSectionHeader('Bank details(Major A/C in the name of the Beneficiary concerned)');
    addFieldRow('Name of Bank', applicationData?.bankDetails?.bankName);
    addFieldRow('IFSC Code', applicationData?.bankDetails?.ifscCode);
    addFieldRow('Branch Name', applicationData?.bankDetails?.branchName);
    addFieldRow('A/C No', applicationData?.bankDetails?.accountNo);
    yPos += 3;

    // Scanned Supporting Document Upload
    createSectionHeader('Scanned Supporting Document Upload');
    const documents = [
      'Mark sheet of Madhyamik Examination or its equivalent(Both sides)',
      'Mark sheet of last Board/Council/University/College Examination',
      'Domiciliary certificate as Aadhaar ID/Voter ID/Ration card/Certificate issued by concerned authority',
      'Scan copy of Bank Passbook (1st Page containing A/C No., IFSC and Beneficiary Name)',
      'Admission Receipt'
    ];
    
    documents.forEach(doc => {
      addFieldRow(doc, '');
    });

    // Add signature field at bottom right of second page
    pdf.setPage(2);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const signatureText = 'Signature of The HOI with Seal';
    const textWidth = pdf.getTextWidth(signatureText);
    const signatureX = pageWidth - margin - textWidth - 40; // 40 units for the dotted line
    const signatureY = pageHeight - 40;
    pdf.text(signatureText, signatureX, signatureY);
    pdf.text('.....................................', signatureX + textWidth, signatureY);

    // Add page numbers and website
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text('VikasPath Scholarship Portal', margin, pageHeight - 10);
      pdf.text(`${i}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Save the PDF
    pdf.save(`Application_${applicationData?.applicantId || 'Draft'}.pdf`);
  };

  const handleViewDocument = (url, title) => {
    setSelectedDocument({ url, title });
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
  };

  const DocumentViewerDialog = () => {
    if (!selectedDocument) return null;

    return (
      <Dialog open={Boolean(selectedDocument)} onClose={handleCloseDocument} maxWidth="md" fullWidth>
        <DialogTitle>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>{selectedDocument.title}</Grid>
            <Grid item>
              <IconButton onClick={handleCloseDocument}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <img
              src={selectedDocument.url}
              alt={selectedDocument.title}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  const renderField = (label, value) => (
    <Grid item xs={12} sm={6}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        <Typography variant="body1" gutterBottom>{value || 'Not provided'}</Typography>
      </Box>
    </Grid>
  );

  const renderDocumentField = (label, url) => {
    return (
      <Grid item xs={12} sm={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">{label}</Typography>
          {url ? (
            <IconButton 
              color="primary" 
              onClick={() => handleViewDocument(url, label)}
            >
              <VisibilityIcon />
            </IconButton>
          ) : (
            <Typography variant="body2" color="error">Not uploaded</Typography>
          )}
        </Box>
      </Grid>
    );
  };

  if (!applicationData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const PrintContent = () => (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4,
        borderBottom: '2px solid #1976d2',
        pb: 2
      }}>
        {/* Left: Logo */}
        <Box sx={{ width: '100px', height: '100px' }}>
          <img 
            src="/wb.png"
            alt="WB Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        {/* Center: Title */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            VIKAS PATH SCHOLARSHIP
          </Typography>
          <Typography variant="h6" sx={{ color: '#666' }}>
            Government of West Bengal
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#666' }}>
            Application Form
          </Typography>
        </Box>

        {/* Right: Student Photo */}
        <Box sx={{ 
          width: '120px', 
          height: '150px', 
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          {applicationData?.documents?.applicantImage ? (
            <img 
              src={applicationData.documents.applicantImage} 
              alt="Student" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain' 
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: '#666' }}>
              No Image
            </Typography>
          )}
        </Box>
      </Box>

      {/* Application Details */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          Application ID: {applicationData?.applicantId || 'Not assigned'}
        </Typography>
        <Typography sx={{ fontWeight: 'bold' }}>
          Date: {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      {/* Student Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          borderBottom: '2px solid #1976d2',
          pb: 1,
          mb: 2,
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          STUDENT INFORMATION
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography><strong>Name:</strong> {applicationData?.name}</Typography>
            <Typography><strong>Email:</strong> {applicationData?.email}</Typography>
            <Typography><strong>Mobile:</strong> {applicationData?.mobile}</Typography>
            <Typography><strong>Gender:</strong> {applicationData?.gender}</Typography>
            <Typography><strong>Category:</strong> {applicationData?.category}</Typography>
            <Typography><strong>Domiciled in West Bengal:</strong> {applicationData?.isDomiciled ? 'Yes' : 'No'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography><strong>Date of Birth:</strong> {applicationData?.dateOfBirth ? new Date(applicationData.dateOfBirth).toLocaleDateString() : 'Not provided'}</Typography>
            <Typography><strong>Religion:</strong> {applicationData?.religion}</Typography>
            <Typography><strong>Caste:</strong> {applicationData?.caste}</Typography>
            <Typography><strong>Status:</strong> {applicationData?.status}</Typography>
            <Typography><strong>Differently Abled:</strong> {applicationData?.isDifferentlyAbled ? 'Yes' : 'No'}</Typography>
            {applicationData?.isDifferentlyAbled === 'yes' && (
              <Typography><strong>Disability Percentage:</strong> {applicationData?.differentlyAbledPercentage}%</Typography>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Academic Details */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          borderBottom: '2px solid #1976d2',
          pb: 1,
          mb: 2,
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          ACADEMIC DETAILS
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography><strong>Qualifying Exam:</strong> {applicationData?.qualifyingExam}</Typography>
            <Typography><strong>Board:</strong> {applicationData?.board}</Typography>
            <Typography><strong>Roll Number:</strong> {applicationData?.rollNo}</Typography>
            <Typography><strong>Year:</strong> {applicationData?.year}</Typography>
            <Typography><strong>Total Marks:</strong> {applicationData?.totalMarks}</Typography>
            <Typography><strong>Marks Obtained:</strong> {applicationData?.marksObtained}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography><strong>Percentage:</strong> {applicationData?.percentage}%</Typography>
            <Typography><strong>Institution:</strong> {applicationData?.institution}</Typography>
            <Typography><strong>Course Name:</strong> {applicationData?.courseName}</Typography>
            <Typography><strong>Course Duration:</strong> {applicationData?.courseDuration} Years</Typography>
            <Typography><strong>District of Institution:</strong> {applicationData?.address?.district}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Parents Details */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          borderBottom: '2px solid #1976d2',
          pb: 1,
          mb: 2,
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          PARENTS DETAILS
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography><strong>Guardian Name:</strong> {applicationData?.guardianDetails?.name}</Typography>
            <Typography><strong>Relation:</strong> {applicationData?.guardianDetails?.relation}</Typography>
            <Typography><strong>Mobile Number:</strong> {applicationData?.guardianDetails?.mobile}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography><strong>Occupation:</strong> {applicationData?.guardianDetails?.occupation}</Typography>
            <Typography><strong>Annual Income:</strong> ₹{applicationData?.guardianDetails?.annualIncome}</Typography>
            <Typography><strong>Domiciled in West Bengal:</strong> {applicationData?.guardianDetails?.domiciled ? 'Yes' : 'No'}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Address */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          borderBottom: '2px solid #1976d2',
          pb: 1,
          mb: 2,
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          ADDRESS
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography><strong>Current Address:</strong></Typography>
              <Typography sx={{ pl: 2 }}>{applicationData?.address?.current}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography><strong>Permanent Address:</strong></Typography>
              <Typography sx={{ pl: 2 }}>{applicationData?.address?.permanent}</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography><strong>House Number:</strong> {applicationData?.address?.houseNo}</Typography>
                <Typography><strong>Street Name:</strong> {applicationData?.address?.streetName}</Typography>
                <Typography><strong>Town/Village:</strong> {applicationData?.address?.townVillage}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><strong>PIN Code:</strong> {applicationData?.address?.pinCode}</Typography>
                <Typography><strong>District:</strong> {applicationData?.address?.district}</Typography>
                <Typography><strong>State:</strong> {applicationData?.address?.state}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Bank Details */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          borderBottom: '2px solid #1976d2',
          pb: 1,
          mb: 2,
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          BANK DETAILS
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography><strong>Bank Name:</strong> {applicationData?.bankDetails?.bankName}</Typography>
            <Typography><strong>Branch Name:</strong> {applicationData?.bankDetails?.branchName}</Typography>
            <Typography><strong>Account Number:</strong> {applicationData?.bankDetails?.accountNo}</Typography>
            <Typography><strong>IFSC Code:</strong> {applicationData?.bankDetails?.ifscCode}</Typography>
            <Typography><strong>Account Holder Name:</strong> {applicationData?.bankDetails?.accountHolderName}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Document Status */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ 
          borderBottom: '2px solid #1976d2',
          pb: 1,
          mb: 2,
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          DOCUMENT STATUS
        </Typography>
        <Typography sx={{ 
          color: checkAllDocumentsUploaded() ? '#2e7d32' : '#d32f2f',
          fontWeight: 'bold'
        }}>
          {checkAllDocumentsUploaded() ? 
            '✓ All Required Documents Uploaded' : 
            '⚠ Some Documents are Pending'}
        </Typography>
      </Box>
    </div>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Typography variant="h6">Application Details</Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {/* Regular view content */}
          <Grid container spacing={3}>
            {/* STUDENT INFORMATION */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  STUDENT INFORMATION
                </Typography>
                <Grid container spacing={2}>
                  {renderField('Applicant ID', applicationData?.applicantId)}
                  {renderField('Name', applicationData?.name)}
                  {renderField('Email', applicationData?.email)}
                  {renderField('Mobile', applicationData?.mobile)}
                  {renderField('Gender', applicationData?.gender)}
                  {renderField('Date of Birth', applicationData?.dateOfBirth ? new Date(applicationData.dateOfBirth).toLocaleDateString() : 'Not provided')}
                  {renderField('Religion', applicationData?.religion)}
                  {renderField('Caste', applicationData?.caste)}
                  {renderField('Application Status', applicationData?.status)}
                </Grid>
              </Paper>
            </Grid>

            {/* ACADEMIC DETAILS */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  ACADEMIC DETAILS
                </Typography>
                <Grid container spacing={2}>
                  {renderField('Qualifying Exam', applicationData?.qualifyingExam)}
                  {renderField('Board', applicationData?.board)}
                  {renderField('Roll Number', applicationData?.rollNo)}
                  {renderField('Year', applicationData?.year)}
                  {renderField('Total Marks', applicationData?.totalMarks)}
                  {renderField('Marks Obtained', applicationData?.marksObtained)}
                  {renderField('Percentage', applicationData?.percentage && `${applicationData.percentage}%`)}
                  {renderField('Institution', applicationData?.institution)}
                  {renderField('Course Name', applicationData?.courseName)}
                  {renderField('Course Duration', applicationData?.courseDuration)}
                </Grid>
              </Paper>
            </Grid>

            {/* PARENTS DETAILS */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  PARENTS DETAILS
                </Typography>
                <Grid container spacing={2}>
                  {renderField('Guardian Name', applicationData?.guardianDetails?.name)}
                  {renderField('Relation', applicationData?.guardianDetails?.relation)}
                  {renderField('Occupation', applicationData?.guardianDetails?.occupation)}
                  {renderField('Annual Income', applicationData?.guardianDetails?.annualIncome && `₹${applicationData.guardianDetails.annualIncome}`)}
                </Grid>
              </Paper>
            </Grid>

            {/* ADDRESS */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  ADDRESS
                </Typography>
                <Grid container spacing={2}>
                  {renderField('Current Address', applicationData?.address?.current)}
                  {renderField('Permanent Address', applicationData?.address?.permanent)}
                  {renderField('House Number', applicationData?.address?.houseNo)}
                  {renderField('Street Name', applicationData?.address?.streetName)}
                  {renderField('Town/Village', applicationData?.address?.townVillage)}
                  {renderField('PIN Code', applicationData?.address?.pinCode)}
                  {renderField('District', applicationData?.address?.district)}
                  {renderField('State', applicationData?.address?.state)}
                </Grid>
              </Paper>
            </Grid>

            {/* BANK DETAILS */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  BANK DETAILS
                </Typography>
                <Grid container spacing={2}>
                  {renderField('Bank Name', applicationData?.bankDetails?.bankName)}
                  {renderField('Account Number', applicationData?.bankDetails?.accountNo)}
                  {renderField('IFSC Code', applicationData?.bankDetails?.ifscCode)}
                </Grid>
              </Paper>
            </Grid>

            {/* DOCUMENT STATUS */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  DOCUMENT STATUS
                </Typography>
                <Typography variant="body1" color={checkAllDocumentsUploaded() ? "success.main" : "error.main"}>
                  {checkAllDocumentsUploaded() ? 
                    '✓ All Required Documents Uploaded' : 
                    '⚠ Some Documents are Pending'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={generatePDF} 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
          >
            Print Application
          </Button>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden printable content */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef}>
          <PrintContent />
        </div>
      </div>

      {/* Document Viewer Dialog */}
      <DocumentViewerDialog />
    </>
  );
};

export default ViewApplication;
