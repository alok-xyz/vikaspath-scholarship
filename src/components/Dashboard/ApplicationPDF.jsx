import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  imageSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 120,
    border: '1pt solid #666',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a237e',
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingVertical: 2,
  },
  label: {
    width: 180,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    flex: 1,
    color: '#444',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 10,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  addressBox: {
    border: '1pt solid #ddd',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  addressTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a237e',
  },
});

const ApplicationPDF = ({ data }) => {
  if (!data) return null;

  // Format address function
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [];
    if (address.houseNo) parts.push(`House No: ${address.houseNo}`);
    if (address.streetName) parts.push(`Street: ${address.streetName}`);
    if (address.townVillage) parts.push(`${address.townVillage}`);
    if (address.district) parts.push(`District: ${address.district}`);
    if (address.state) parts.push(`${address.state}`);
    if (address.pinCode) parts.push(`PIN: ${address.pinCode}`);
    return parts.join(', ');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>VikasPath Scholarship Application</Text>
          <Text>Application ID: {data.studentData?.applicantId || 'N/A'}</Text>
        </View>

        {/* Student Photo */}
        <View style={styles.imageSection}>
          {data.documents?.applicantImage && (
            <Image 
              src={data.documents.applicantImage} 
              style={styles.image} 
            />
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{data.studentData?.name || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>
              {data.studentData?.dob ? new Date(data.studentData.dob).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{data.studentData?.gender || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.studentData?.email || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile:</Text>
            <Text style={styles.value}>{data.studentData?.mobile || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{data.studentData?.category || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Domiciled in West Bengal:</Text>
            <Text style={styles.value}>
              {data.isDomiciled ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Differently Abled:</Text>
            <Text style={styles.value}>
              {data.isDifferentlyAbled ? 'Yes' : 'No'}
            </Text>
          </View>
          {data.isDifferentlyAbled && (
            <View style={styles.row}>
              <Text style={styles.label}>Disability Percentage:</Text>
              <Text style={styles.value}>
                {data.differentlyAbledPercentage}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Guardian Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guardian Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Guardian Name:</Text>
            <Text style={styles.value}>{data.guardianDetails?.name || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Relation:</Text>
            <Text style={styles.value}>{data.guardianDetails?.relation || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Occupation:</Text>
            <Text style={styles.value}>{data.guardianDetails?.occupation || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Annual Income:</Text>
            <Text style={styles.value}>₹ {data.guardianDetails?.annualIncome || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile Number:</Text>
            <Text style={styles.value}>{data.guardianDetails?.mobile || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Address Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          
          {/* Current Address */}
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Current Address</Text>
            <Text>{formatAddress(data.address?.current)}</Text>
          </View>

          {/* Permanent Address */}
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Permanent Address</Text>
            <Text>{formatAddress(data.address?.permanent)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bank Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Bank Name:</Text>
            <Text style={styles.value}>{data.bankDetails?.bankName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Branch Name:</Text>
            <Text style={styles.value}>{data.bankDetails?.branchName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IFSC Code:</Text>
            <Text style={styles.value}>{data.bankDetails?.ifscCode || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Number:</Text>
            <Text style={styles.value}>{data.bankDetails?.accountNo || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Holder Name:</Text>
            <Text style={styles.value}>{data.bankDetails?.accountHolderName || 'N/A'}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on: {new Date().toLocaleString()}</Text>
          <Text>VikasPath Scholarship Portal - Government of West Bengal</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ApplicationPDF;
