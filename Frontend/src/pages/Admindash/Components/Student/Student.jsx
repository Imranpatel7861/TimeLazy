import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Download, CalendarDays, Users, Building2, UploadCloud, File, AlertCircle, CheckCircle, X, Eye, EyeOff, GraduationCap, BookOpen, FileText, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import styles from './Student.module.css';

const initialData = {
  'SE': {
    divisions: ['Division A', 'Division B', 'Division C', 'Division D'],
    students: {
      'Division A': [],
      'Division B': [],
      'Division C': [],
      'Division D': []
    }
  },
  'TE': {
    divisions: ['Division A', 'Division B', 'Division C', 'Division D'],
    students: {
      'Division A': [],
      'Division B': [],
      'Division C': [],
      'Division D': []
    }
  },
  'BE': {
    divisions: ['Division A', 'Division B', 'Division C', 'Division D'],
    students: {
      'Division A': [],
      'Division B': [],
      'Division C': [],
      'Division D': []
    }
  }
};

const Student = () => {
  const [data, setData] = useState(initialData);
  const [openYear, setOpenYear] = useState(null);
  const [openDivision, setOpenDivision] = useState({});
  const [showStudents, setShowStudents] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/students');
      const studentsData = response.data;
      const organizedData = JSON.parse(JSON.stringify(initialData));

      studentsData.forEach(student => {
        if (organizedData[student.year] && organizedData[student.year].students[student.division]) {
          organizedData[student.year].students[student.division].push(student);
        }
      });

      setData(organizedData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleYear = (year) => {
    setOpenYear(openYear === year ? null : year);
    setOpenDivision({});
    setShowUploadModal(null);
  };

  const toggleDivision = (year, division) => {
    setOpenDivision((prev) => ({
      ...prev,
      [year]: prev[year] === division ? null : division
    }));
    setShowUploadModal(null);
  };

  const toggleUploadModal = (year, division) => {
    const uploadKey = `${year}-${division}`;
    setShowUploadModal(showUploadModal === uploadKey ? null : uploadKey);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleStudentList = (year, division) => {
    const key = `${year}-${division}`;
    setShowStudents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const [year, division] = showUploadModal.split('-');
    setUploadProgress({ status: 'processing', message: 'Processing file...' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);
    formData.append('division', division);

    try {
      const response = await axios.post('http://localhost:5000/api/admin/students/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        setUploadProgress({
          status: 'success',
          message: `Successfully uploaded students!`
        });

        await fetchStudents();
        setTimeout(() => {
          setShowUploadModal(null);
          setUploadProgress(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress({
        status: 'error',
        message: 'Error processing file. Please try again.'
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteStudent = async (year, division, studentId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/admin/students/${studentId}`);
      if (response.status === 200) {
        await fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  };

  const handleGeneratePDF = (year, division) => {
    const doc = new jsPDF();
    const students = data[year].students[division];
    doc.text(`${year} - ${division} Students`, 10, 10);
    students.forEach((student, index) => {
      const y = 20 + (index * 15);
      doc.text(`${index + 1}. Name: ${student.name}`, 10, y);
      doc.text(`   Roll No: ${student.rollNo || student.roll_no}`, 10, y + 5);
      doc.text(`   PRN: ${student.prn}`, 10, y + 10);
    });
    doc.save(`${year}_${division}_students.pdf`);
  };

  const getYearColor = (year) => {
    const colors = {
      'SE': styles.seGradient,
      'TE': styles.teGradient,
      'BE': styles.beGradient
    };
    return colors[year];
  };

  const getYearIcon = (year) => {
    const icons = {
      'SE': <Users size={24} />,
      'TE': <FileText size={24} />,
      'BE': <GraduationCap size={24} />
    };
    return icons[year];
  };

  const totalStudents = Object.values(data).reduce((total, yearData) => {
    return total + Object.values(yearData.students).reduce((yearTotal, divisionStudents) => {
      return yearTotal + divisionStudents.length;
    }, 0);
  }, 0);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div className={styles.headerIcon}>
              <GraduationCap className={styles.headerIconSvg} size={32} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>
                Student Management System
              </h1>
              <p className={styles.headerSubtitle}>Manage students across all academic years and divisions</p>
            </div>
            <div className={styles.studentCount}>
              <div className={styles.studentCountNumber}>{totalStudents}</div>
              <div className={styles.studentCountLabel}>Total Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {Object.entries(data).map(([year, yearData]) => (
          <div key={year} className={styles.yearCard}>
            {/* Year Header */}
            <div
              className={`${styles.yearHeader} ${getYearColor(year)}`}
              onClick={() => toggleYear(year)}
              aria-expanded={openYear === year}
              role="button"
              tabIndex="0"
            >
              <div className={styles.yearHeaderContent}>
                <div className={styles.yearIcon}>
                  {getYearIcon(year)}
                </div>
                <div>
                  <h2 className={styles.yearTitle}>{year} Year</h2>
                  <p className={styles.yearSubtitle}>
                    {Object.values(yearData.students).reduce((total, students) => total + students.length, 0)} students enrolled
                  </p>
                </div>
                <div className={openYear === year ? styles.rotate180 : ''}>
                  <div className={styles.chevronIcon}>
                    <svg className={styles.chevronSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Year Content */}
            {openYear === year && (
              <div className={styles.yearContent}>
                <div className={styles.divisionGrid}>
                  {yearData.divisions.map((division) => (
                    <div key={division} className={styles.divisionCard}>
                      {/* Division Header */}
                      <div
                        className={styles.divisionHeader}
                        onClick={() => toggleDivision(year, division)}
                        aria-expanded={openDivision[year] === division}
                        role="button"
                        tabIndex="0"
                      >
                        <div className={styles.divisionHeaderContent}>
                          <div className={styles.divisionIcon}>
                            <Users size={20} />
                          </div>
                          <div>
                            <h3 className={styles.divisionTitle}>{division}</h3>
                            <div className={styles.divisionDetails}>
                              <span className={styles.studentBadge}>
                                {yearData.students[division].length} Students
                              </span>
                              <span className={styles.studentLabel}>Click to manage</span>
                            </div>
                          </div>
                          <div className={openDivision[year] === division ? styles.rotate180 : ''}>
                            <div className={styles.chevronIcon}>
                              <svg className={styles.chevronSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Division Content */}
                      {openDivision[year] === division && (
                        <div className={styles.divisionContent}>
                          {/* Action Buttons */}
                          <div className={styles.actionButtons}>
                            <button
                              className={`${styles.actionButton} ${styles.downloadButton}`}
                              onClick={() => handleGeneratePDF(year, division)}
                              aria-label={`Generate PDF for ${year} ${division}`}
                            >
                              <Download size={18} />
                              <span>Generate PDF</span>
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.uploadButton}`}
                              onClick={() => toggleUploadModal(year, division)}
                              aria-label={`Bulk upload students to ${year} ${division}`}
                            >
                              <UploadCloud size={18} />
                              <span>Upload PDF</span>
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.showButton}`}
                              onClick={() => toggleStudentList(year, division)}
                              aria-label={`Show students in ${year} ${division}`}
                            >
                              {showStudents[`${year}-${division}`] ? <EyeOff size={18} /> : <Eye size={18} />}
                              <span>{showStudents[`${year}-${division}`] ? 'Hide Students' : 'Show Students'}</span>
                            </button>
                          </div>

                          {/* Bulk Upload Modal */}
                          {showUploadModal === `${year}-${division}` && (
                            <div className={styles.uploadModal}>
                              <div className={styles.uploadModalHeader}>
                                <h4 className={styles.uploadModalTitle}>
                                  <UploadCloud className={styles.uploadModalIcon} size={20} />
                                  <span>Upload PDF for {division}</span>
                                </h4>
                                <button
                                  className={styles.uploadModalClose}
                                  onClick={() => toggleUploadModal(year, division)}
                                  aria-label="Close upload modal"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                              <div className={styles.uploadModalContent}>
                                <div className={styles.uploadInstructions}>
                                  <h5 className={styles.instructionsTitle}>File Format Instructions:</h5>
                                  <div className={styles.formatList}>
                                    <div className={styles.formatItem}>
                                      <FileText className={styles.formatIcon} size={16} />
                                      <div>
                                        <strong>PDF File (.pdf)</strong>
                                        <p>Upload a PDF containing student details. The backend will extract and store the data.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className={styles.uploadArea}>
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf"
                                    className={styles.uploadInput}
                                    id={`upload-${year}-${division}`}
                                  />
                                  <label
                                    htmlFor={`upload-${year}-${division}`}
                                    className={styles.uploadLabel}
                                  >
                                    <UploadCloud size={24} />
                                    <span>Choose PDF File or Drag & Drop</span>
                                    <small>Supported format: PDF</small>
                                  </label>
                                </div>
                                {/* Upload Progress */}
                                {uploadProgress && (
                                  <div className={`${styles.uploadProgress} ${styles[uploadProgress.status]}`}>
                                    <div className={styles.progressIcon}>
                                      {uploadProgress.status === 'processing' && <UploadCloud size={20} />}
                                      {uploadProgress.status === 'success' && <CheckCircle size={20} />}
                                      {uploadProgress.status === 'error' && <AlertCircle size={20} />}
                                    </div>
                                    <span>{uploadProgress.message}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Student List */}
                          {showStudents[`${year}-${division}`] && (
                            <div className={styles.studentListContainer}>
                              <h4 className={styles.studentListTitle}>
                                <Users className={styles.studentListTitleIcon} size={20} />
                                <span>Students in {year} - {division}</span>
                                <span className={styles.studentBadgeInList}>
                                  {yearData.students[division].length}
                                </span>
                              </h4>
                              {yearData.students[division].length === 0 ? (
                                <div className={styles.emptyStudentList}>
                                  <div className={styles.emptyIcon}>
                                    <Users className={styles.emptyIconSvg} size={32} />
                                  </div>
                                  <p className={styles.emptyText}>No students added yet</p>
                                  <p className={styles.emptySubtext}>Click "Upload PDF" to get started</p>
                                </div>
                              ) : (
                                <div className={styles.studentGrid}>
                                  {yearData.students[division].map((student, index) => (
                                    <div key={student.id} className={styles.studentItem}>
                                      <div className={styles.studentInfoContainer}>
                                        <div className={styles.studentAvatar}>
                                          {index + 1}
                                        </div>
                                        <div className={styles.studentInfo}>
                                          <h5 className={styles.studentName}>{student.name}</h5>
                                          <div className={styles.studentDetails}>
                                            <span className={styles.studentDetailBadge}>
                                              Roll: {student.rollNo || student.roll_no}
                                            </span>
                                            <span className={styles.studentDetailBadge}>
                                              PRN: {student.prn}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteStudent(year, division, student.id)}
                                        className={styles.deleteButton}
                                        aria-label={`Delete student ${student.name}`}
                                      >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerText}>
            <p>Student Management System - Streamline your academic administration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;