import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Building2 } from 'lucide-react';
import styles from './Classes.module.css';

const Classes = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [newClassroom, setNewClassroom] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Safely parse logged-in user from localStorage
  let adminId = null;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      adminId = parsedUser?.id || null;
    }
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
  }

  const API_BASE = 'http://localhost:5000/api/classrooms';

  // Fetch classrooms for this admin
  const fetchClassrooms = async () => {
    if (!adminId) {
      setError('Admin ID is missing — please log in.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, {
        params: { admin_id: adminId }
      });
      setClassrooms(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error fetching classrooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [adminId]);

  // Add new classroom
  const handleAdd = async () => {
    if (!adminId) {
      setError('Cannot add classroom — Admin ID is missing.');
      return;
    }

    const trimmed = newClassroom.trim();
    if (!trimmed) {
      setError('Classroom number is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (classrooms.some(cls => String(cls.classroom_number) === trimmed)) {
      setError('Classroom already exists');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await axios.post(API_BASE, { 
        classroom_number: trimmed,
        admin_id: adminId
      });
      setNewClassroom('');
      fetchClassrooms();
    } catch (err) {
      console.error(err);
      setError('Failed to add classroom');
    }
  };

  // Delete classroom
  const handleDelete = async (classroomId) => {
    if (!adminId) {
      setError('Cannot delete classroom — Admin ID is missing.');
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${classroomId}`, {
        params: { admin_id: adminId }
      });
      fetchClassrooms();
    } catch (err) {
      console.error(err);
      setError('Failed to delete classroom');
    }
  };

  return (
    <div className={styles.animatedBackground}>
      <div className={styles.container}>
        <h2 className={styles.title}>Classroom Management</h2>

        <div className={styles.inputRow}>
          <input
            type="number"
            value={newClassroom}
            onChange={(e) => {
              setNewClassroom(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="Enter classroom number"
            className={styles.input}
            disabled={loading || !adminId}
          />
          <button 
            onClick={handleAdd} 
            className={styles.addBtn} 
            disabled={loading || !adminId}
          >
            <Plus size={24} /> Add
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Loading classrooms...</div>
        ) : classrooms.length === 0 ? (
          <div className={styles.emptyState}>
            <Building2 size={48} />
            <p>No classrooms found. Add one to get started.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {classrooms.map((classroom) => (
              <div key={classroom.id} className={styles.card}>
                <div className={styles.classInfo}>
                  <Building2 size={24} />
                  <span className={styles.roomText}>
                    Room {classroom.classroom_number}
                  </span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(classroom.id)}
                  aria-label={`Delete classroom ${classroom.classroom_number}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;
