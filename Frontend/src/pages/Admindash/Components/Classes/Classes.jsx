import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Building2 } from 'lucide-react';
import styles from './Classes.module.css';

const Classes = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [newClassroom, setNewClassroom] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch classrooms from backend
  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/classrooms');
      setClassrooms(res.data);
      setError('');
    } catch (err) {
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
    const trimmed = newClassroom.trim();
    if (!trimmed) {
      setError('Classroom number is required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/classrooms', { classroom_name: trimmed });
      setNewClassroom('');
      setError('');
      fetchClassrooms();
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response.data.error || 'Classroom already exists');
      } else {
        setError('Failed to add classroom');
      }
    }
  };

  // Delete classroom by ID
  const handleDelete = async (classroomId) => {
    try {
      await axios.delete(`http://localhost:5000/api/classrooms/${classroomId}`);
      fetchClassrooms();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete classroom');
    }
  };

  return (
    <div className={styles.animatedBackground}>
      <div className={styles.container}>
        <h2 className={styles.title}>Classroom Management</h2>
        <div className={styles.inputRow}>
          <input
            type="text"
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
          />
          <button onClick={handleAdd} className={styles.addBtn}>
            <Plus size={24} /> Add
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {loading ? (
          <div className={styles.loading}>Loading classrooms...</div>
        ) : (
          <div className={styles.grid}>
            {classrooms.map((classroom) => (
              <div key={classroom.id} className={styles.card}>
                <div className={styles.classInfo}>
                  <Building2 size={24} />
                  <span className={styles.roomText}>Room {classroom.classroom_name}</span>
                </div>
                <button className={styles.deleteBtn} onClick={() => handleDelete(classroom.id)}>
                  <Trash2 size={36} />
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
