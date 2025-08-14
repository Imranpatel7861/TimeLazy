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
    abbreviation: '',
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      fetchTeachersByAdmin(user.id);
    }
  }, []);

  const fetchTeachersByAdmin = async (adminId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teachers?admin_id=${adminId}`);
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  const generateAbbreviation = (name) => {
    return name
      .split(' ')
      .map(part => part[0].toUpperCase())
      .join('');
  };

  const handleAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setFormData({ name: '', subject: '', email: '', abbreviation: '' });
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
        // Optimistic UI update
        setTeachers(prev => prev.filter(t => t.id !== id));

        await axios.delete(`http://localhost:5000/api/teachers/${id}`);

        // Refresh from backend to stay in sync
        fetchTeachersByAdmin(user.id);
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'name') {
      const newAbbreviation = generateAbbreviation(value);
      setFormData(prev => ({
        ...prev,
        abbreviation: newAbbreviation,
      }));
    }
  };

  const user = JSON.parse(localStorage.getItem('user')); // logged-in admin

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        admin_id: user.id // send admin_id
      };

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/teachers/${currentTeacher.id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/teachers', payload);
      }

      fetchTeachersByAdmin(user.id); // refresh list
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
      abbreviation: '',
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const parsedData = parseFileContent(content);
        setTeachers(prev => [...prev, parsedData]);
      };
      reader.readAsText(file);
    }
  };

  const parseFileContent = (content) => {
    const defaultName = 'Uploaded Teacher';
    return {
      id: Math.max(0, ...teachers.map(t => t.id)) + 1,
      name: defaultName,
      subject: 'Unknown',
      email: 'uploaded@eduadmin.com',
      abbreviation: generateAbbreviation(defaultName),
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
        setTeachers(prev => [...prev, parsedData]);
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
        <div className={styles.buttonGroup}>
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
        <div className={styles.formContainer}>
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
              <label htmlFor="abbreviation">Abbreviation</label>
              <input
                type="text"
                id="abbreviation"
                name="abbreviation"
                value={formData.abbreviation}
                onChange={handleInputChange}
                readOnly
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
              <button type="submit" className={styles.submitBtn}>
                {isEditing ? 'Update Teacher' : 'Add Teacher'}
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
          <div key={teacher.id} className={styles.teacherCard}>
            <div className={styles.teacherInfo}>
              <div className={styles.avatar} style={{ backgroundColor: getRandomColor() }}>
                {getInitials(teacher.name)}
              </div>
              <div className={styles.teacherDetails}>
                <h2 className={styles.teacherAbbreviation}>
                  {teacher.abbreviation}
                </h2>
                <h4 className={styles.teacherName}>{teacher.name}</h4>
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
                <Edit3 size={25} className={styles.actionIcon} />
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(teacher.id)} aria-label="Delete teacher">
                <Trash2 size={25} className={styles.actionIcon} />
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

const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

export default Teacher;
