
import React, { useEffect } from 'react';
import styles from './Compare.module.css';
import { useTheme } from '../Theme/ThemeContext';

const Compare = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, { threshold: 0.1 });

    const container = document.querySelector(`.${styles.comparisonContainer}`);
    if (container) {
      observer.observe(container);
    }

    const cells = document.querySelectorAll(`.${styles.aiCell}, .${styles.manualCell}`);
    cells.forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        const progressBar = cell.querySelector(`.${styles.progressBar}`);
        const value = progressBar.getAttribute('data-value');
        progressBar.style.width = `${value}%`;
      });

      cell.addEventListener('mouseleave', () => {
        const progressBar = cell.querySelector(`.${styles.progressBar}`);
        progressBar.style.width = '0%';
      });
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`${styles.comparisonContainer} ${theme === 'dark' ? styles.dark : ''}`}
      id="comparison-container"
    >
      <div className={styles.comparisonHeader}>
        <h2>AI vs Manual Timetable Creation</h2>
        <p>Discover why TimeLazy's AI outperforms traditional methods</p>
      </div>

      <table className={styles.comparisonTable}>
        <thead>
          <tr>
            <th>Feature</th>
            <th><span className={styles.aiBadge}>TimeLazy AI</span></th>
            <th><span className={styles.manualBadge}>Manual Tools</span></th>
          </tr>
        </thead>
        
          <tbody>
         <tr>
        <td className={styles.featureCell}>Speed</td>
             <td className={styles.aiCell}>
               <div className={styles.cellContent}>
                 <i className="fas fa-bolt icon"></i><br />
                 <span className={`${styles.highlight} ${styles.bestFeature}`}>30 seconds</span>
                 <div className={styles.progressContainer}>
                   <div className={styles.progressBar} data-value="95"></div>
                 </div>
               </div>
             </td>
             <td className={styles.manualCell}>
               <div className={styles.cellContent}>
                <i className="fas fa-hourglass-half icon"></i><br />
                 1+ hour
                 <div className={styles.progressContainer}>
                   <div className={styles.progressBar} data-value="20"></div>
                 </div>
               </div>
             </td>
           </tr>
           <tr>
            <td className={styles.featureCell}>Conflict Detection</td>
            <td className={styles.aiCell}>
              <div className={styles.cellContent}>
                 <i className="fas fa-check-circle icon"></i><br />
                 <span className={`${styles.highlight} ${styles.bestFeature}`}>Auto-fixed</span>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} data-value="90"></div>
                 </div>
               </div>
            </td>
            <td className={styles.manualCell}>
              <div className={styles.cellContent}>
                <i className="fas fa-exclamation-triangle icon"></i><br />
                Manual checks
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} data-value="30"></div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className={styles.featureCell}>Optimization</td>
            <td className={styles.aiCell}>
              <div className={styles.cellContent}>
                <i className="fas fa-brain icon"></i><br />
                <span className={`${styles.highlight} ${styles.bestFeature}`}>AI-driven</span>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} data-value="100"></div>
                </div>
              </div>
            </td>
            <td className={styles.manualCell}>
              <div className={styles.cellContent}>
                <i className="fas fa-dice icon"></i><br />
                Guesswork
                 <div className={styles.progressContainer}>
                   <div className={styles.progressBar} data-value="40"></div>
                 </div>
               </div>
            </td>
           </tr>
          <tr>
            <td className={styles.featureCell}>Personalization</td>
            <td className={styles.aiCell}>
              <div className={styles.cellContent}>
                <i className="fas fa-user-cog icon"></i><br />
                 <span className={`${styles.highlight} ${styles.bestFeature}`}>Energy & focus-based</span>
                <div className={styles.progressContainer}>
                   <div className={styles.progressBar} data-value="85"></div>
                 </div>
               </div>
             </td>
             <td className={styles.manualCell}>
               <div className={styles.cellContent}>
               <i className="fas fa-user icon"></i><br />
                 Basic preferences
                 <div className={styles.progressContainer}>
                  <div className={styles.progressBar} data-value="50"></div>
                 </div>
              </div>
           </td>
           </tr>
           <tr>
             <td className={styles.featureCell}>Updates</td>
             <td className={styles.aiCell}>
               <div className={styles.cellContent}>
                 <i className="fas fa-sync-alt icon"></i><br />
                 <span className={styles.highlight}>Instant adjustments</span>
                 <div className={styles.progressContainer}>
                   <div className={styles.progressBar} data-value="95"></div>
                </div>
              </div>
            </td>
           <td className={styles.manualCell}>
               <div className={styles.cellContent}>
                 <i className="fas fa-eraser icon"></i><br />
                Start from scratch
                <div className={styles.progressContainer}>
                   <div className={styles.progressBar} data-value="25"></div>
                </div>
              </div>
             </td>
          </tr>
                </tbody>
      </table>
    </div>
  );
};

export default Compare;
