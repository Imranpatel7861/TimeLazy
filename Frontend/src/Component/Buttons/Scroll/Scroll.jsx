import React, { useEffect, useState } from 'react';
import styles from './Scroll.module.css';

const Scroll = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      className={`${styles.scrollToTop} ${visible ? styles.visible : ''}`}
      id="scrollToTopBtn"
      onClick={scrollToTop}
    >
      ↑
    </button>
  );
};

export default Scroll;
