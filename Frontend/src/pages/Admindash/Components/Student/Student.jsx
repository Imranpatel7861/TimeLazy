import React, { useState, useRef } from 'react';
import { Download, CalendarDays, Users, Building2, Plus, Trash2, User, BookOpen, GraduationCap, FileText, Upload, Eye, EyeOff, UploadCloud, File, AlertCircle, CheckCircle, X } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(null);
  const [showStudents, setShowStudents] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    prn: '',
    file: null
  });

  const toggleYear = (year) => {
    setOpenYear(openYear === year ? null : year);
    setOpenDivision({});
    setShowForm(null);
    setShowStudents({});
    setShowUploadModal(null);
  };

  const toggleDivision = (year, division) => {
    setOpenDivision((prev) => ({
      ...prev,
      [year]: prev[year] === division ? null : division
    }));
    setShowForm(null);
    setShowUploadModal(null);
  };

  const toggleForm = (year, division) => {
    const formKey = `${year}-${division}`;
    setShowForm(showForm === formKey ? null : formKey);
    setShowUploadModal(null);
    setFormData({
      name: '',
      rollNo: '',
      prn: '',
      file: null
    });
  };

  const toggleUploadModal = (year, division) => {
    const uploadKey = `${year}-${division}`;
    setShowUploadModal(showUploadModal === uploadKey ? null : uploadKey);
    setShowForm(null);
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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleFormSubmit = () => {
    if (!formData.name || !formData.rollNo || !formData.prn) {
      alert('Please fill all required fields');
      return;
    }
    const [year, division] = showForm.split('-');
    const newStudent = {
      id: Date.now(),
      name: formData.name,
      rollNo: formData.rollNo,
      prn: formData.prn,
      file: formData.file ? formData.file.name : null
    };
    setData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        students: {
          ...prev[year].students,
          [division]: [...prev[year].students[division], newStudent]
        }
      }
    }));
    alert(`Student added to ${year} - ${division}`);
    setShowForm(null);
    setFormData({
      name: '',
      rollNo: '',
      prn: '',
      file: null
    });
  };

  const parseTextFile = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const students = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.includes(',')) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          students.push({
            id: Date.now() + i,
            name: parts[0],
            rollNo: parts[1],
            prn: parts[2],
            file: null
          });
        }
      }
      else if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          students.push({
            id: Date.now() + i,
            name: parts[0],
            rollNo: parts[1],
            prn: parts[2],
            file: null
          });
        }
      }
      else if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim());
        if (parts.length >= 3) {
          students.push({
            id: Date.now() + i,
            name: parts[0],
            rollNo: parts[1],
            prn: parts[2],
            file: null
          });
        }
      }
    }

    return students;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const [year, division] = showUploadModal.split('-');

    setUploadProgress({ status: 'processing', message: 'Processing file...' });
    try {
      let students = [];
      const fileType = file.name.split('.').pop().toLowerCase();
      if (fileType === 'txt') {
        const text = await file.text();
        students = parseTextFile(text);
      } else if (fileType === 'pdf') {
        setUploadProgress({
          status: 'error',
          message: 'PDF parsing requires additional libraries. Please convert to TXT format for now.'
        });
        return;
      } else if (fileType === 'doc' || fileType === 'docx') {
        setUploadProgress({
          status: 'error',
          message: 'Word document parsing requires additional libraries. Please convert to TXT format for now.'
        });
        return;
      } else {
        setUploadProgress({
          status: 'error',
          message: 'Unsupported file format. Please use TXT, PDF, or DOC files.'
        });
        return;
      }
      if (students.length === 0) {
        setUploadProgress({
          status: 'error',
          message: 'No valid student data found in file. Please check the format.'
        });
        return;
      }
      setData(prev => ({
        ...prev,
        [year]: {
          ...prev[year],
          students: {
            ...prev[year].students,
            [division]: [...prev[year].students[division], ...students]
          }
        }
      }));
      setUploadProgress({
        status: 'success',
        message: `Successfully uploaded ${students.length} students!`
      });

      setTimeout(() => {
        setShowUploadModal(null);
        setUploadProgress(null);
      }, 2000);
    } catch (error) {
      setUploadProgress({
        status: 'error',
        message: 'Error processing file. Please try again.'
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteStudent = (year, division, studentId) => {
    setData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        students: {
          ...prev[year].students,
          [division]: prev[year].students[division].filter(student => student.id !== studentId)
        }
      }
    }));
  };

  const handleGeneratePDF = (year, division) => {
    const doc = new jsPDF();
    const students = data[year].students[division];
    doc.text(`${year} - ${division} Students`, 10, 10);
    students.forEach((student, index) => {
      const y = 20 + (index * 15);
      doc.text(`${index + 1}. Name: ${student.name}`, 10, y);
      doc.text(`   Roll No: ${student.rollNo}`, 10, y + 5);
      doc.text(`   PRN: ${student.prn}`, 10, y + 10);
    });
    doc.save(`${year}_${division}_students.pdf`);
  };

  const getYearColor = (year) => {
    const colors = {
      'FE': styles.feGradient,
      'SE': styles.seGradient,
      'TE': styles.teGradient,
      'BE': styles.beGradient
    };
    return colors[year];
  };

  const getYearIcon = (year) => {
    const icons = {
      'FE': <BookOpen size={24} />,
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
                            >
                              <Download size={18} />
                              <span>Generate PDF</span>
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.addButton}`}
                              onClick={() => toggleForm(year, division)}
                            >
                              <Plus size={18} />
                              <span>Add Student</span>
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.uploadButton}`}
                              onClick={() => toggleUploadModal(year, division)}
                            >
                              <UploadCloud size={18} />
                              <span>Bulk Upload</span>
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.showButton}`}
                              onClick={() => toggleStudentList(year, division)}
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
                                  <span>Bulk Upload Students to {division}</span>
                                </h4>
                                <button
                                  className={styles.uploadModalClose}
                                  onClick={() => toggleUploadModal(year, division)}
                                >
                                  <X size={18} />
                                </button>
                              </div>

                              <div className={styles.uploadModalContent}>
                                <div className={styles.uploadInstructions}>
                                  <h5 className={styles.instructionsTitle}>File Format Instructions:</h5>
                                  <div className={styles.formatList}>
                                    <div className={styles.formatItem}>
                                      <File className={styles.formatIcon} size={16} />
                                      <div>
                                        <strong>Text File (.txt)</strong>
                                        <p>Format: Name, RollNo, PRN (comma separated) or Name | RollNo | PRN</p>
                                      </div>
                                    </div>
                                    <div className={styles.formatItem}>
                                      <FileText className={styles.formatIcon} size={16} />
                                      <div>
                                        <strong>PDF File (.pdf)</strong>
                                        <p>Convert to text format for processing</p>
                                      </div>
                                    </div>
                                    <div className={styles.formatItem}>
                                      <FileText className={styles.formatIcon} size={16} />
                                      <div>
                                        <strong>Word Document (.doc, .docx)</strong>
                                        <p>Convert to text format for processing</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className={styles.uploadArea}>
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".txt,.pdf,.doc,.docx"
                                    className={styles.uploadInput}
                                    id={`upload-${year}-${division}`}
                                  />
                                  <label
                                    htmlFor={`upload-${year}-${division}`}
                                    className={styles.uploadLabel}
                                  >
                                    <UploadCloud size={24} />
                                    <span>Choose File or Drag & Drop</span>
                                    <small>Supported formats: TXT, PDF, DOC, DOCX</small>
                                  </label>
                                </div>
                                {/* Upload Progress */}
                                {uploadProgress && (
                                  <div className={`${styles.uploadProgress} ${styles[uploadProgress.status]}`}>
                                    <div className={styles.progressIcon}>
                                      {uploadProgress.status === 'processing' && <Upload size={20} />}
                                      {uploadProgress.status === 'success' && <CheckCircle size={20} />}
                                      {uploadProgress.status === 'error' && <AlertCircle size={20} />}
                                    </div>
                                    <span>{uploadProgress.message}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Add Student Form */}
                          {showForm === `${year}-${division}` && (
                            <div className={styles.formContainer}>
                              <h4 className={styles.formTitle}>
                                <Plus className={styles.formTitleIcon} size={20} />
                                <span>Add New Student to {division}</span>
                              </h4>
                              <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>Full Name</label>
                                  <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter student's full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                  />
                                </div>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>Roll Number</label>
                                  <input
                                    type="text"
                                    name="rollNo"
                                    placeholder="Enter roll number"
                                    value={formData.rollNo}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                  />
                                </div>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>PRN Number</label>
                                  <input
                                    type="text"
                                    name="prn"
                                    placeholder="Enter PRN number"
                                    value={formData.prn}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                  />
                                </div>
                                <div className={styles.formGroup}>
                                  <label className={styles.formLabel}>Upload Document</label>
                                  <div>
                                    <input
                                      type="file"
                                      name="file"
                                      onChange={handleInputChange}
                                      className={styles.formFileInput}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={styles.formActions}>
                                <button
                                  onClick={handleFormSubmit}
                                  className={styles.submitButton}
                                >
                                  <Upload size={18} />
                                  <span>Add Student</span>
                                </button>
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
                                  <p className={styles.emptySubtext}>Click "Add Student" or "Bulk Upload" to get started</p>
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
                                              Roll: {student.rollNo}
                                            </span>
                                            <span className={styles.studentDetailBadge}>
                                              PRN: {student.prn}
                                            </span>
                                            {student.file && (
                                              <span className={styles.fileBadge}>
                                                <FileText size={14} />
                                                <span>{student.file}</span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteStudent(year, division, student.id)}
                                        className={styles.deleteButton}
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

      {/* Footer */}
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
