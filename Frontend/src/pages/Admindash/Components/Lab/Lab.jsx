// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Plus, Trash2, FlaskConical } from 'lucide-react';
// import styles from './Lab.module.css';

// const Lab = () => {
//   const [labs, setLabs] = useState([]);
//   const [newLab, setNewLab] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const fetchLabs = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get('http://localhost:5000/api/labs');
//       setLabs(res.data);
//       setError('');
//     } catch (err) {
//       setError('Error fetching labs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLabs();
//   }, []);

//   const handleAdd = async () => {
//     const trimmed = newLab.trim().toUpperCase();
//     if (!trimmed) {
//       setError('Lab number is required');
//       return;
//     }
//     try {
//       await axios.post('http://localhost:5000/api/labs', { lab_name: trimmed });
//       setNewLab('');
//       setError('');
//       fetchLabs();
//     } catch (err) {
//       if (err.response?.status === 409) {
//         setError(err.response.data.error || 'Lab already exists');
//       } else {
//         setError('Failed to add lab');
//       }
//     }
//   };

//   const handleDelete = async (lab_id) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/labs/${lab_id}`);
//       fetchLabs();
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to delete lab');
//     }
//   };

//   return (
//     <div className={styles.animatedBackground}>
//       <div className={styles.container}>
//         <h2 className={styles.title}>Lab Management</h2>
//         <div className={styles.inputRow}>
//           <input
//             type="text"
//             value={newLab}
//             onChange={(e) => {
//               setNewLab(e.target.value);
//               setError('');
//             }}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter') handleAdd();
//             }}
//             placeholder="Enter lab number"
//             className={styles.input}
//           />
//           <button onClick={handleAdd} className={styles.addBtn}>
//             <Plus size={24} /> Add
//           </button>
//         </div>
//         {error && <div className={styles.error}>{error}</div>}
//         {loading ? (
//           <div className={styles.loading}>Loading labs...</div>
//         ) : (
//           <div className={styles.grid}>
//             {labs.map((lab) => (
//               <div key={lab.id} className={styles.card}>
//                 <div className={styles.classInfo}>
//                   <FlaskConical size={24} />
//                   <span className={styles.roomText}>Lab {lab.lab_name}</span>
//                 </div>
//                 <button className={styles.deleteBtn} onClick={() => handleDelete(lab.id)}>
//                   <Trash2 size={36} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Lab;
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FlaskConical, Beaker } from 'lucide-react';
import styles from './Lab.module.css';

const API_BASE = "http://localhost:5000/api"; // Backend base URL

const Lab = () => {
  const [labs, setLabs] = useState([]);
  const [newLab, setNewLab] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/labs`);
      if (!res.ok) throw new Error("Failed to fetch labs");
      const data = await res.json();
      setLabs(data);
      setError('');
    } catch (err) {
      console.error(err);
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
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (labs.some(lab => lab.lab_name === trimmed)) {
      setError('Lab already exists');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/labs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_name: trimmed })
      });
      if (!res.ok) throw new Error('Failed to add lab');
      await fetchLabs();
      setNewLab('');
    } catch (err) {
      console.error(err);
      setError('Failed to add lab');
    }
  };

  const handleDelete = async (labId) => {
    try {
      const res = await fetch(`${API_BASE}/labs/${labId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete lab');
      setLabs(prev => prev.filter(lab => lab.id !== labId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete lab');
    }
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
            type="number"
            value={newLab}
            onChange={(e) => {
              setNewLab(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
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
        </div>
        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}
      </section>

      <main className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <p className={styles.loadingText}>Loading laboratories...</p>
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
                    onClick={() => handleDelete(lab.id)}
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
