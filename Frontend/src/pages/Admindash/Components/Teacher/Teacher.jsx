import React, { useState, useRef, useEffect } from 'react';
import { Users, Edit3, Trash2, Plus, Upload } from 'lucide-react';
import axios from 'axios';
import styles from './Teacher.module.css';

const Teacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

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

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this teacher?');
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/teachers/${id}`);
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/teachers/${currentTeacher.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/teachers', formData);
      }
      fetchTeachers();
      resetForm();
    } catch (error) {
      console.error('Error saving teacher:', error);
    }
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
        const parsedData = parseFileContent(content);
        setTeachers((prev) => [...prev, parsedData]);
      };
      reader.readAsText(file);
    }
  };

  const parseFileContent = (content) => {
    return {
      id: Math.max(0, ...teachers.map((t) => t.id)) + 1,
      name: 'Uploaded Teacher',
      subject: 'Unknown',
      email: 'uploaded@eduadmin.com',
    };
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
      <div className={styles.teachersList} onDragOver={handleDragOver} onDrop={handleDrop}>
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
              <button className={styles.editBtn} onClick={() => handleEdit(teacher)} aria-label="Edit teacher">
                <Edit3 size={30} className={styles.actionIcon} />
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(teacher.id)} aria-label="Delete teacher">
                <Trash2 size={30} className={styles.actionIcon} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getRandomColor = () => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default Teacher;
