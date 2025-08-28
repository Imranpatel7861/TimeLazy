import React, { useState, useRef, useEffect } from 'react';
import { FlaskConical, Trash2, Plus, Beaker } from 'lucide-react';
import axios from 'axios';
import styles from './Lab.module.css';

const Lab = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newLab, setNewLab] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.id) {
      fetchLabsByAdmin(user.id);
    }
  }, []);

  const fetchLabsByAdmin = async (adminId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/labs?admin_id=${adminId}`);
      setLabs(response.data);
    } catch (error) {
      console.error('Failed to fetch labs', error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newLab.trim()) {
      setError('Lab name cannot be empty.');
      return;
    }
    try {
      const payload = {
        lab_name: newLab.trim(),
        description: 'Newly added lab',
        admin_id: user.id,
      };
      await axios.post('http://localhost:5000/api/labs', payload);
      setSuccess(`Lab "${newLab}" added successfully.`);
      setNewLab('');
      setShowModal(false);
      fetchLabsByAdmin(user.id);
    } catch (error) {
      console.error('Error adding lab:', error);
      setError('Failed to add lab.');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete lab "${name}"?`);
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/labs/${id}?admin_id=${user.id}`);
        setSuccess(`Lab "${name}" deleted successfully.`);
        fetchLabsByAdmin(user.id);
      } catch (error) {
        console.error('Error deleting lab:', error);
        setError('Failed to delete lab.');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const parsedData = parseFileContent(reader.result);
        setLabs((prev) => [...prev, parsedData]);
        setSuccess(`Lab from file "${file.name}" uploaded successfully.`);
      };
      reader.readAsText(file);
    }
  };

  const parseFileContent = (content) => {
    return {
      id: Math.max(0, ...labs.map((lab) => lab.id)) + 1,
      lab_name: 'Uploaded Lab',
      description: 'Uploaded via file',
    };
  };

  return (
    <div className={styles.labManagerContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Laboratory Management</h1>
        <p className={styles.subtitle}>Streamlined lab space organization</p>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}
      {success && <div className={styles.successBox}>{success}</div>}

      <main className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <p>Loading laboratories...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className={styles.emptyState}>
            <FlaskConical size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No laboratories found</h3>
            <p className={styles.emptySubtitle}>
              Start by adding your first lab to the system.
            </p>
          </div>
        ) : (
          <div className={styles.labGrid}>
            {labs.map((lab) => (
              <article key={lab.id} className={styles.labCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.labIcon}>
                    <Beaker size={24} />
                  </span>
                  <h2 className={styles.labNumber}>{lab.lab_name}</h2>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(lab.id, lab.lab_name)}
                    aria-label={`Delete laboratory ${lab.lab_name}`}
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <button className={styles.fab} onClick={() => setShowModal(true)}>
        <Plus size={24} />
      </button>

      <div className={`${styles.modal} ${showModal ? styles.active : ''}`}>
        <div className={styles.modalContent}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>
            Add Laboratory
          </h3>
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
            placeholder="Enter lab number (e.g., A101, B205)"
            className={styles.modalInput}
          />
          <div className={styles.modalButtons}>
            <button
              className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept=".pdf,.txt,.doc,.docx"
      />
    </div>
  );
};

export default Lab;
