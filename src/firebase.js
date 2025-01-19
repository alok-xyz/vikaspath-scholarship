import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc,
  getDoc 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDKq5e52EHx87V-UHhO14x7xDs_eS_EzY4",
  authDomain: "vikaspath-scholarship.firebaseapp.com",
  projectId: "vikaspath-scholarship",
  storageBucket: "vikaspath-scholarship.appspot.com",
  messagingSenderId: "992146418871",
  appId: "1:992146418871:web:e6a6459261e17fa4c3b132"
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase initialization error', error.stack);
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure CORS for storage
storage._customUrlBuilder = (bucket, path) => {
  const url = `https://${bucket}.storage.googleapis.com/${path}`;
  return url;
};

// Function to register a new user
const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: error.message };
  }
};

// Function to sign in a user
const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
};

// Function to sign out a user
const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Function to add student data
const addStudentData = async (studentData) => {
  try {
    const studentsRef = collection(db, 'students');
    const docRef = await addDoc(studentsRef, {
      ...studentData,
      createdAt: new Date().toISOString(),
      status: 'Pending'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding student data:', error);
    return { success: false, error: error.message };
  }
};

// Function to get student data by email
const getStudentByEmail = async (email) => {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Return the first matching document
      const doc = querySnapshot.docs[0];
      return { ...doc.data(), id: doc.id };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting student by email:', error);
    throw error;
  }
};

// Function to update application form
const updateApplicationForm = async (studentId, formData) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    
    // First check if the document exists
    const docSnap = await getDoc(studentRef);
    if (!docSnap.exists()) {
      throw new Error('Student record not found');
    }

    // Update the document with form data
    await updateDoc(studentRef, {
      applicationForm: formData,
      applicationSubmitted: true,
      lastUpdated: new Date().toISOString(),
      status: 'Submitted'
    });

    return { 
      success: true, 
      message: 'Application form updated successfully' 
    };
  } catch (error) {
    console.error('Error updating application form:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update application form' 
    };
  }
};

// Function to upload documents
const uploadDocument = async (file, studentId, documentType) => {
  try {
    const fileRef = ref(storage, `documents/${studentId}/${documentType}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    
    // Update the student record with the document URL
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, {
      [`documents.${documentType}`]: downloadURL,
      lastUpdated: new Date().toISOString()
    });

    return { 
      success: true, 
      url: downloadURL,
      message: 'Document uploaded successfully' 
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to upload document' 
    };
  }
};

// Function to get the current application count
const getApplicationCount = async () => {
  try {
    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting application count:', error);
    throw error;
  }
};

// Function to login with applicant ID
const loginWithApplicantId = async (applicantId, password) => {
  try {
    // First get the user email from applicantId
    const q = query(collection(db, 'students'), where('applicantId', '==', applicantId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid Applicant ID');
    }

    const studentDoc = querySnapshot.docs[0];
    const studentData = studentDoc.data();

    // Use Firebase authentication to sign in
    try {
      const userCredential = await signInWithEmailAndPassword(auth, studentData.email, password);
      return {
        success: true,
        student: {
          id: studentDoc.id,
          ...studentData,
          user: userCredential.user
        }
      };
    } catch (authError) {
      console.error('Authentication error:', authError);
      throw new Error('Invalid Password');
    }
  } catch (error) {
    console.error('Error logging in with applicant ID:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Function to get students by institution
const getStudentsByInstitution = async (institutionName) => {
  try {
    // Normalize institution name
    const normalizedInstitutionName = institutionName
      ? institutionName
          .replace('-dashboard', '')
          .toUpperCase()
          .replace(/_/g, ' ')
      : null;

    if (!normalizedInstitutionName) {
      throw new Error('No institution name provided');
    }

    // Query students for the specific institution
    const studentsRef = collection(db, 'students');
    
    // Try multiple query variations to handle different naming formats
    const q = query(studentsRef, where('institution', '==', normalizedInstitutionName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching students by institution:', error);
    throw error;
  }
};

// Export Firebase instances and Firestore functions
export { 
  auth, 
  db,
  storage,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  ref,
  uploadBytes,
  getDownloadURL,
  registerUser,
  signInUser,
  signOutUser,
  addStudentData,
  getStudentByEmail,
  updateApplicationForm,
  uploadDocument,
  getApplicationCount,
  loginWithApplicantId,
  getStudentsByInstitution
};
