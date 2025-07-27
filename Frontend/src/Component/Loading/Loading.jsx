// src/Component/Loading.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Loading.module.css';

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/landing'); // or '/main' or '/' if that's your homepage
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.sphericalLoaderContainer} id="sphericalLoader">
      <div className={styles.sphericalLoader}>
        <div className={styles.sphericalCircle}></div>
        <div className={styles.sphericalCircle}></div>
        <div className={styles.sphericalCircle}></div>
        <div className={styles.sphericalCircle}></div>
        <div className={styles.sphericalRipple}></div>
        <div className={styles.sphericalRipple}></div>
        <div className={styles.sphericalRipple}></div>
        <div className={styles.sphericalLogo}>TimeLazy</div>
      </div>
    </div>
  );
};

export default Loading;
