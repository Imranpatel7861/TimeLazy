import React from 'react';
import styles from './ChooseMode.module.css';

const ChooseMode = () => {
  return (
    <section className={styles.chooseMode}>
      <h2 data-aos="fade-up">Choose Your Mode</h2>
      <p className={styles.subtitle} data-aos="fade-up" data-aos-delay="100">
        Whether you're planning for yourself, your team, or a whole organization—we've got you covered.
      </p>

      <div className={styles.cards}>
        {/* Personal Card */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="200">
          <div className={styles.cardIcon}><i className="fas fa-user"></i></div>
          <h3>Personal</h3>
          <p>Perfect for students, teachers, or freelancers managing their own schedule.</p>
          <ul>
            <li>AI-powered daily planner</li>
            <li>Study & work modes</li>
            <li>Mobile optimized</li>
            <li>Progress tracking</li>
            <li>Smart reminders</li>
          </ul>
          <a href="#" className={`${styles.btn} ${styles.personal}`}>Start for Free</a>
        </div>

        {/* Team Card */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="400">
          <div className={styles.cardIcon}><i className="fas fa-users"></i></div>
          <h3>Team</h3>
          <p>Collaborate and schedule smarter with shared access and real-time updates.</p>
          <ul>
            <li>Shared calendar & tasks</li>
            <li>Real-time collaboration</li>
            <li>Manage class assignments</li>
            <li>Group analytics</li>
            <li>Role-based permissions</li>
          </ul>
          <a href="#" className={`${styles.btn} ${styles.team}`}>Try Team Mode</a>
        </div>

        {/* Organization Card */}
        <div className={styles.card} data-aos="fade-up" data-aos-delay="600">
          <div className={styles.cardIcon}><i className="fas fa-university"></i></div>
          <h3>Organization</h3>
          <p>Built for schools, colleges, and training centers to manage everything at scale.</p>
          <ul>
            <li>Admin dashboard</li>
            <li>Bulk timetable generation</li>
            <li>Analytics & role access</li>
            <li>Custom reporting</li>
            <li>API integration</li>
          </ul>
          <a href="#" className={`${styles.btn} ${styles.org}`}>Request Demo</a>
        </div>
      </div>
    </section>
  );
};

export default ChooseMode;
