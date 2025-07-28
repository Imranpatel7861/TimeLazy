import React, { useState } from 'react';
import { Plus, Trash2, Building2 } from 'lucide-react';
import styles from './Classes.module.css';

const Classes = () => {
  const [classrooms, setClassrooms] = useState(['503', '504', '518']);
  const [newClassroom, setNewClassroom] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = newClassroom.trim();
    if (!trimmed) return;

    if (classrooms.includes(trimmed)) {
      setError(`Classroom ${trimmed} already exists!`);
    } else {
      const updated = [...classrooms, trimmed].sort((a, b) => Number(a) - Number(b));
      setClassrooms(updated);
      setError('');
      setNewClassroom('');
    }
  };

  const handleDelete = (room) => {
    const updated = classrooms.filter(c => c !== room).sort((a, b) => Number(a) - Number(b));
    setClassrooms(updated);
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
          />
          <button onClick={handleAdd} className={styles.addBtn}>
            <Plus size={24} /> Add
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.grid}>
          {classrooms.map((room, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.classInfo}>
                <Building2 size={24} />
                <span className={styles.roomText}>Room {room}</span>
              </div>
              <button className={styles.deleteBtn} onClick={() => handleDelete(room)}>
                <Trash2 size={36} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Classes;
