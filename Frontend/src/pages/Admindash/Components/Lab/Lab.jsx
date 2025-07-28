import React, { useState } from 'react';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import styles from './Lab.module.css';

const Lab = () => {
  const [labs, setLabs] = useState(['101', '202', '303']);
  const [newLab, setNewLab] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = newLab.trim().toUpperCase();
    if (!trimmed) return;

    if (labs.includes(trimmed)) {
      setError(`Lab ${trimmed} already exists!`);
    } else {
      const updated = [...labs, trimmed].sort();
      setLabs(updated);
      setError('');
      setNewLab('');
    }
  };

  const handleDelete = (lab) => {
    const updated = labs.filter(l => l !== lab).sort();
    setLabs(updated);
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

        <div className={styles.grid}>
          {labs.map((lab, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.classInfo}>
                <FlaskConical size={24} />
                <span className={styles.roomText}>Lab {lab}</span>
              </div>
              <button className={styles.deleteBtn} onClick={() => handleDelete(lab)}>
                <Trash2 size={36} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lab;
