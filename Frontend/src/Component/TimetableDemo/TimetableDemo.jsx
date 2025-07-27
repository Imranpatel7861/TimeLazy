import React, { useState, useEffect } from 'react';
import Sortable from 'sortablejs';
import styles from './TimetableDemo.module.css';

const TimetableDemo = () => {
  const [theme, setTheme] = useState('purple');
  const [currentSubject, setCurrentSubject] = useState(null);
  const [facultyNames] = useState([
    "Dr. Thompson", "Prof. Singh", "Dr. Chen", "Prof. Martinez", "Dr. Johnson",
    "Prof. Williams", "Dr. Patel", "Dr. Garcia", "Prof. Lee", "Dr. Kumar",
    "Prof. Wilson", "Ms. Rodriguez", "Dr. Brown", "Prof. Davis", "Dr. Miller",
    "Prof. Taylor", "Dr. Harris", "Prof. Martin", "Dr. Lewis", "Prof. Walker",
    "Dr. Hall", "Prof. Allen", "Dr. Young", "Prof. King", "Dr. Wright", "Prof. Scott"
  ]);

  useEffect(() => {
    const containers = document.querySelectorAll(`.${styles.subjectContainer}`);
    containers.forEach(container => {
      new Sortable(container, {
        group: 'shared',
        animation: 150,
        ghostClass: styles.sortableGhost,
        chosenClass: styles.sortableChosen,
        onStart: function (evt) {
          evt.item.classList.add(styles.dragging);
        },
        onEnd: function (evt) {
          evt.item.classList.remove(styles.dragging);
          const newDay = evt.item.closest('td').cellIndex;
          const newTime = evt.item.closest('tr').cells[0].textContent;
          const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          if (newDay > 0) {
            evt.item.dataset.day = days[newDay];
            evt.item.dataset.time = newTime;
          }
        }
      });
    });

    const subjects = document.querySelectorAll(`.${styles.subject}`);
    subjects.forEach(subject => {
      subject.addEventListener('click', function (e) {
        if (!this.classList.contains(styles.dragging)) {
          showSubjectDetails(this);
        }
      });
    });
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    const preview = document.querySelector(`.${styles.timetablePreview}`);
    preview.classList.remove(
      styles.themePurple,
      styles.themeGreen,
      styles.themeOrange,
      styles.themePink
    );
    preview.classList.add(styles[`theme${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`]);

    preview.classList.add(styles.animate__animated, styles.animate__pulse);
    setTimeout(() => {
      preview.classList.remove(styles.animate__animated, styles.animate__pulse);
    }, 1000);
  };

  const showSubjectDetails = (subject) => {
    const modal = document.getElementById('subjectModal');
    document.getElementById('modalTitle').textContent = subject.textContent.split('\n')[0].trim();
    document.getElementById('modalDay').textContent = subject.dataset.day;
    document.getElementById('modalTime').textContent = subject.dataset.time;
    document.getElementById('modalRoom').textContent = subject.dataset.room;
    const facultySpan = subject.querySelector(`.${styles.facultyName}`);
    document.getElementById('modalFaculty').textContent = facultySpan ? facultySpan.textContent : 'N/A';
    openModal('subjectModal');
  };

  const changeFaculty = (subject) => {
    setCurrentSubject(subject);
    const facultyList = document.getElementById('facultyList');
    facultyList.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const randomIndex = Math.floor(Math.random() * facultyNames.length);
      const facultyOption = document.createElement('div');
      facultyOption.className = styles.facultyOption;
      facultyOption.textContent = facultyNames[randomIndex];
      facultyOption.addEventListener('click', function () {
        const facultySpan = subject.querySelector(`.${styles.facultyName}`);
        if (facultySpan) {
          facultySpan.textContent = this.textContent;
        } else {
          const span = document.createElement('span');
          span.className = styles.facultyName;
          span.textContent = this.textContent;
          subject.appendChild(span);
        }
        closeModal('facultyModal');
      });
      facultyList.appendChild(facultyOption);
    }
    openModal('facultyModal');
  };

  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add(styles.active);
    }, 10);
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    modal.classList.remove(styles.active);
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  };

  const times = [
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 1:00"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const sampleData = {
    "9:00 - 10:00": ["Math", "Physics", "Chemistry", "Biology", "Math"],
    "10:00 - 11:00": ["English", "Math", "Physics Lab", "History", "Geography"],
    "11:00 - 12:00": ["Break", "Break", "Break", "Break", "Break"],
    "12:00 - 1:00": ["Computer Science", "Chemistry Lab", "Math", "English", "Art"]
  };

  const sampleRooms = [
    "Room 101", "Room 203", "Room 305", "Room 402", "Room 204",
    "Lab 1", "Room 205", "Room 301", "Cafeteria", "Lab 3", "Lab 2", "Art Studio"
  ];

  const generateFaculty = (subject) => {
    return facultyNames[Math.floor(Math.random() * facultyNames.length)];
  };

  return (
    <section className={`${styles.timetablePreview} ${styles.animate__animated} ${styles.animate__fadeIn} ${styles[`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`]}`}>
      <h2 className={`${styles.animate__animated} ${styles.animate__bounceIn}`}>DEMO TimeTable by TimeLazy</h2>

      <div className={`${styles.themeControls} ${styles.animate__animated} ${styles.animate__fadeInUp}`}>
        <div className={styles.themeBtn} style={{ background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)' }} onClick={() => changeTheme('purple')}></div>
        <div className={styles.themeBtn} style={{ background: 'linear-gradient(90deg, #43a047 0%, #66bb6a 100%)' }} onClick={() => changeTheme('green')}></div>
        <div className={styles.themeBtn} style={{ background: 'linear-gradient(90deg, #ef6c00 0%, #ffa726 100%)' }} onClick={() => changeTheme('orange')}></div>
        <div className={styles.themeBtn} style={{ background: 'linear-gradient(90deg, #c2185b 0%, #f48fb1 100%)' }} onClick={() => changeTheme('pink')}></div>
      </div>

      <div className={`${styles.featuresInfo} ${styles.animate__animated} ${styles.animate__fadeIn}`}>
        <strong>💡 Features:</strong> Drag and drop subjects to rearrange them, click on a subject to see details, or double-click to change the faculty
      </div>

      <table className={`${styles.timetable} ${styles.animate__animated} ${styles.animate__fadeInUp}`}>
        <thead>
          <tr>
            <th>Time/Day</th>
            {days.map((day, index) => (
              <th key={index} className={`${styles.animate__animated} ${styles[`animate__delay${index + 1}`]}`}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time, rowIdx) => (
            <tr key={rowIdx}>
              <td className={styles.timeCol}>{time}</td>
              {days.map((day, colIdx) => {
                const subject = sampleData[time][colIdx];
                const room = sampleRooms[(rowIdx * days.length + colIdx) % sampleRooms.length];
                return (
                  <td key={`${rowIdx}-${colIdx}`} className={styles.subjectContainer}>
                    <div
                      className={styles.subject}
                      data-day={day}
                      data-time={time}
                      data-room={room}
                      onDoubleClick={(e) => changeFaculty(e.currentTarget)}
                    >
                      {subject}
                      {subject !== 'Break' && (
                        <span className={styles.facultyName}>{generateFaculty(subject)}</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Subject Details Modal */}
      <div className={styles.modal} id="subjectModal">
        <div className={styles.modalContent}>
          <span className={styles.closeButton} onClick={() => closeModal('subjectModal')}>×</span>
          <h3 id="modalTitle">Subject Details</h3>
          <p><strong>Day:</strong> <span id="modalDay"></span></p>
          <p><strong>Time:</strong> <span id="modalTime"></span></p>
          <p><strong>Location:</strong> <span id="modalRoom"></span></p>
          <p><strong>Faculty:</strong> <span id="modalFaculty"></span></p>
        </div>
      </div>

      {/* Faculty Selection Modal */}
      <div className={styles.modal} id="facultyModal">
        <div className={styles.modalContent}>
          <span className={styles.closeButton} onClick={() => closeModal('facultyModal')}>×</span>
          <h3>Select Faculty</h3>
          <div className={styles.facultyList} id="facultyList"></div>
        </div>
      </div>
    </section>
  );
};

export default TimetableDemo;
