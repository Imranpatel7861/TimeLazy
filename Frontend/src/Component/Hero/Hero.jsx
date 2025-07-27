import React from 'react';
import styles from './hero.module.css';

const Hero = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gridPattern}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Master Your <span className={styles.highlight}>Time</span>,
            <br />
            Exchange Your Tradition with <span className={styles.highlight}>TimeLazy</span>
          </h1>

          <p className={styles.subtitle}>
            Create intelligent, dynamic timetables that align with your organization's needs.
            Eliminate scheduling chaos and foster seamless coordination across teams and departments.
          </p>

          <div className={styles.ctaGroup}>
            <button
              className={styles.primaryBtn}
              onClick={() => scrollToSection('organizeSection')}
            >
              <span>Start Organizing</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => scrollToSection('demoSection')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polygon fill="currentColor" points="9.5,7.5 9.5,16.5 16.5,12"/>
              </svg>
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        <div className={styles.visualSection}>
          <div className={styles.mockup}>
            <div className={styles.phone}>
              <div className={styles.phoneScreen}>
                <div className={styles.timeHeader}>
                  <div className={styles.timeDisplay}>9:30 AM</div>
                  <div className={styles.dateDisplay}>Today, Oct 15</div>
                </div>
                <div className={styles.scheduleItems}>
                  <div className={`${styles.scheduleItem} ${styles.active}`}>
                    <div className={styles.itemTime}>9:30</div>
                    <div className={styles.itemContent}>
                      <div className={styles.itemTitle}>Team Meeting</div>
                      <div className={styles.itemLocation}>Conference Room A</div>
                    </div>
                  </div>
                  <div className={styles.scheduleItem}>
                    <div className={styles.itemTime}>11:00</div>
                    <div className={styles.itemContent}>
                      <div className={styles.itemTitle}>Project Review</div>
                      <div className={styles.itemLocation}>Online</div>
                    </div>
                  </div>
                  <div className={styles.scheduleItem}>
                    <div className={styles.itemTime}>2:30</div>
                    <div className={styles.itemContent}>
                      <div className={styles.itemTitle}>Client Call</div>
                      <div className={styles.itemLocation}>Zoom</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
