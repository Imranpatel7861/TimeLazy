import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Building2 } from 'lucide-react';
import styles from './Classes.module.css';

const Classes = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [newClassroom, setNewClassroom] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Replace with your backend base URL
  const API_BASE = 'http://localhost:5000/api/classrooms';

  // Fetch classrooms
  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
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
  }, []);

  // Add new classroom
  const handleAdd = async () => {
    const trimmed = newClassroom.trim().toUpperCase();
    if (!trimmed) {
      setError('Classroom number is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (classrooms.some(cls => cls.classroom_name === trimmed)) {
      setError('Classroom already exists');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await axios.post(API_BASE, { classroom_name: trimmed });
      setNewClassroom('');
      fetchClassrooms();
    } catch (err) {
      console.error(err);
      setError('Failed to add classroom');
    }
  };

  // Delete classroom
  const handleDelete = async (classroomId) => {
    try {
      await axios.delete(`${API_BASE}/${classroomId}`);
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
            disabled={loading}
          />
          <button onClick={handleAdd} className={styles.addBtn} disabled={loading}>
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
                  <span className={styles.roomText}>Room {classroom.classroom_name}</span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(classroom.id)}
                  aria-label={`Delete classroom ${classroom.classroom_name}`}
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
