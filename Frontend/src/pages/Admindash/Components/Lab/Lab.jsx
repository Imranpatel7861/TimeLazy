import React, { useState, useRef, useEffect } from 'react';
import { FlaskConical, Trash2, Plus, Upload, Beaker } from 'lucide-react';
import axios from 'axios';
import styles from './Lab.module.css';

const Lab = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newLab, setNewLab] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      <header className={styles.header}>
        <h1 className={styles.title}>Laboratory Management</h1>
        <p className={styles.subtitle}>Streamlined lab space organization</p>
      </header>

      <section className={styles.inputArea}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={newLab}
            onChange={(e) => {
              setNewLab(e.target.value);
              setError('');
              setSuccess('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Enter lab number (e.g., A101, B205)"
            className={styles.input}
            disabled={loading}
          />
          <button
            onClick={handleAdd}
            className={styles.addButton}
            disabled={loading}
          >
            <Plus size={20} />
            <span className={styles.addButtonText}>Add Laboratory</span>
          </button>
         
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.doc,.docx"
          />
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className={styles.successBox}>
            <span>{success}</span>
          </div>
        )}
      </section>

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
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.statusIndicator}>
                    <span className={styles.statusDot}></span>
                    <span className={styles.statusText}>Operational</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Lab;
