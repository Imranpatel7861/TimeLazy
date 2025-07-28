
import React, { useState } from 'react';
import { Download, CalendarDays, Users, Building2 } from 'lucide-react';
import styles from './Student.module.css';

const data = {
  'Computer Science Department': {
    'First Year': ['Division A', 'Division B'],
    'Second Year': [],
    'Third Year': [],
    'Fourth Year': []
  },
  'Information Technology Department': {
    'First Year': ['Division A', 'Division B'],
    'Second Year': [],
    'Third Year': [],
    'Fourth Year': []
  },
  'Electronic and Telecommunication Department': {
    'First Year': ['Division A'],
    'Second Year': [],
    'Third Year': [],
    'Fourth Year': []
  },
  'Mechanical Engineering Department': {
    'First Year': [],
    'Second Year': [],
    'Third Year': [],
    'Fourth Year': []
  }
};

const Student = () => {
  const [openDept, setOpenDept] = useState(null);
  const [openYear, setOpenYear] = useState({});

  const toggleDept = (dept) => {
    setOpenDept(openDept === dept ? null : dept);
    setOpenYear({});
  };

  const toggleYear = (dept, year) => {
    setOpenYear((prev) => ({
      ...prev,
      [dept]: prev[dept] === year ? null : year
    }));
  };

  const handleDownload = (division) => {
    alert(`Generate PDF clicked for ${division}`);
  };

  return (
    <div className={styles.container}>
      {Object.entries(data).map(([dept, years]) => (
        <div key={dept} className={styles.accordion}>
          <div className={styles.accordionHeader} onClick={() => toggleDept(dept)}>
            <div className={styles.deptTitle}>
              <Building2 size={20} />
              <strong>{dept}</strong>
            </div>
            <span className={styles.arrow}>{openDept === dept ? '▲' : '▼'}</span>
          </div>

          {openDept === dept && (
            <div className={styles.yearContainer}>
              {Object.entries(years).map(([year, divisions]) => (
                <div key={year} className={styles.yearBlock}>
                  <div className={styles.yearHeader} onClick={() => toggleYear(dept, year)}>
                    <CalendarDays size={18} />
                    <span className={styles.yearLabel}>{year}</span>
                    <span className={styles.arrow}>{openYear[dept] === year ? '▲' : '▼'}</span>
                  </div>

                  {openYear[dept] === year && divisions.length > 0 && (
                    <div className={styles.divisionList}>
                      {divisions.map((division, idx) => (
                        <div key={idx} className={styles.divisionItem}>
                          <div className={styles.divisionLabel}>
                            <Users size={18} /> <strong>{division}</strong>
                          </div>
                          <button className={styles.pdfBtn} onClick={() => handleDownload(division)}>
                            <Download size={16} /> Generate PDF
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Student;
