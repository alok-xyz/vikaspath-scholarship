import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { getApplicantByUserId } from '../services/firebase';

const StudentDataContext = createContext();

export const useStudentData = () => useContext(StudentDataContext);

export const StudentDataProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = auth.currentUser;
      if (!user) {
        setStudentData(null);
        return;
      }

      const data = await getApplicantByUserId(user.uid);
      setStudentData(data);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchStudentData();
      } else {
        setStudentData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    studentData,
    loading,
    error,
    fetchStudentData
  };

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
};
