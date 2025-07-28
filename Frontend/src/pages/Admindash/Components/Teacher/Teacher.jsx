
import React, { useState, useRef } from 'react';
import { Users, Edit3, Trash2, Plus, Upload } from 'lucide-react';
import styles from './Teacher.module.css';

const Teacher = () => {
  const [teachers, setTeachers] = useState([
    { id: 1, name: 'Dr. Smith', subject: 'Mathematics', email: 'drsmith@eduadmin.com' },
    { id: 2, name: 'Prof. Johnson', subject: 'Physics', email: 'profjohnson@eduadmin.com' },
    { id: 3, name: 'Dr. Williams', subject: 'Chemistry', email: 'drwilliams@eduadmin.com' },
    { id: 4, name: 'Ms. Brown', subject: 'Biology', email: 'msbrown@eduadmin.com' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
  });

  const fileInputRef = useRef(null);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const handleAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setFormData({ name: '', subject: '', email: '' });
  };

  const handleEdit = (teacher) => {
    setCurrentTeacher(teacher);
    setFormData(teacher);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this teacher?');
    if (confirmed) {
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === currentTeacher.id ? { ...teacher, ...formData } : teacher
        )
      );
    } else {
      const newTeacher = {
        id: Math.max(...teachers.map(t => t.id)) + 1,
        ...formData,
      };
      setTeachers((prev) => [...prev, newTeacher]);
    }
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setCurrentTeacher(null);
    setFormData({
      name: '',
      subject: '',
      email: '',
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        // Parse content to extract teacher information
        // This is a placeholder for actual parsing logic
        const parsedData = parseFileContent(content);
        setTeachers((prev) => [...prev, parsedData]);
      };
      reader.readAsText(file);
    }
  };

  const parseFileContent = (content) => {
    // Placeholder for parsing logic
    // This function should parse the content and return an object with teacher information
    return { id: Math.max(...teachers.map(t => t.id)) + 1, name: 'Uploaded Teacher', subject: 'Unknown', email: 'uploaded@eduadmin.com' };
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const parsedData = parseFileContent(content);
        setTeachers((prev) => [...prev, parsedData]);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={styles.teachersContainer}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>
          <Users size={28} className={styles.titleIcon} />
          Teachers Management
        </h2>
        <div>
          <button className={styles.addBtn} onClick={handleAdd}>
            <Plus size={24} className={styles.btnIcon} />
            Add Teacher
          </button>
          <button className={styles.uploadBtn} onClick={() => fileInputRef.current.click()}>
            <Upload size={24} className={styles.btnIcon} />
            Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.doc,.docx"
          />
        </div>
      </div>
      {(isAdding || isEditing) && (
        <div className={`${styles.formContainer} ${isAdding ? styles.formSlideIn : ''} ${isEditing ? styles.formFadeIn : ''}`}>
          <h3 className={styles.formTitle}>
            {isEditing ? 'Edit Teacher Details' : 'Add New Teacher'}
          </h3>
          <form onSubmit={handleSubmit} className={styles.teacherForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={`${styles.submitBtn} ${isEditing ? styles.updateBtn : ''}`}>
                {isEditing ? 'Update Teacher' : 'Add'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      <div
        className={styles.teachersList}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {teachers.map((teacher) => (
          <div key={teacher.id} className={`${styles.teacherCard} ${styles.cardHover}`}>
            <div className={styles.teacherInfo}>
              <div className={styles.avatar} style={{ backgroundColor: getRandomColor() }}>
                {getInitials(teacher.name)}
              </div>
              <div className={styles.teacherDetails}>
                <h3 className={styles.teacherName}>{teacher.name}</h3>
                <p className={styles.teacherSubject}>
                  <span className={styles.subjectBadge}>{teacher.subject}</span>
                </p>
                <p className={styles.teacherEmail}>
                  <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
                </p>
              </div>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.editBtn}
                onClick={() => handleEdit(teacher)}
                aria-label="Edit teacher"
              >
                <Edit3 size={30} className={styles.actionIcon} />
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(teacher.id)}
                aria-label="Delete teacher"
              >
                <Trash2 size={30} className={styles.actionIcon} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to generate random colors for avatars
const getRandomColor = () => {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#6366f1', // indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default Teacher;
