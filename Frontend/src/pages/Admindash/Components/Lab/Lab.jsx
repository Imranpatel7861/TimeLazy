import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import styles from './Lab.module.css';

const Lab = () => {
  const [labs, setLabs] = useState([]);
  const [newLab, setNewLab] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/labs');
      setLabs(res.data);
      setError('');
    } catch (err) {
      setError('Error fetching labs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleAdd = async () => {
    const trimmed = newLab.trim().toUpperCase();
    if (!trimmed) {
      setError('Lab number is required');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/labs', { lab_name: trimmed });
      setNewLab('');
      setError('');
      fetchLabs();
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response.data.error || 'Lab already exists');
      } else {
        setError('Failed to add lab');
      }
    }
  };

  const handleDelete = async (lab_id) => {
    try {
      await axios.delete(`http://localhost:5000/api/labs/${lab_id}`);
      fetchLabs();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete lab');
    }
  };

  return (
    <div className={styles.animatedBackground}>
      <div className={styles.container}>
        <h2 className={styles.title}>Lab Management</h2>
        <div className={styles.inputRow}>
          <input
            type="text"
            value={newLab}
            onChange={(e) => {
              setNewLab(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="Enter lab number"
            className={styles.input}
          />
          <button onClick={handleAdd} className={styles.addBtn}>
            <Plus size={24} /> Add
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {loading ? (
          <div className={styles.loading}>Loading labs...</div>
        ) : (
          <div className={styles.grid}>
            {labs.map((lab) => (
              <div key={lab.id} className={styles.card}>
                <div className={styles.classInfo}>
                  <FlaskConical size={24} />
                  <span className={styles.roomText}>Lab {lab.lab_name}</span>
                </div>
                <button className={styles.deleteBtn} onClick={() => handleDelete(lab.id)}>
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

export default Lab;
