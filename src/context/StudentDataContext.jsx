import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, getStudentByEmail } from '../firebase';

const StudentDataContext = createContext();

export const useStudentData = () => useContext(StudentDataContext);

export const StudentDataProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser?.email) {
        setStudentData(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getStudentByEmail(currentUser.email);
        if (data) {
          setStudentData(data);
          setError(null);
        } else {
          setError('Student data not found');
          setStudentData(null);
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data');
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  const updateStudentData = async () => {
    if (!currentUser?.email) return;

    try {
      const data = await getStudentByEmail(currentUser.email);
      if (data) {
        setStudentData(data);
        setError(null);
      }
    } catch (err) {
      console.error('Error updating student data:', err);
      setError('Failed to update student data');
    }
  };

  const value = {
    studentData,
    loading,
    error,
    updateStudentData
  };

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
};

export default StudentDataContext;
