import React from 'react';
import styles from './Chatbot.module.css';

const Chatbot = () => {
  return (
    <div id={styles.chatbotButton} className={styles.chatbotButton}>
      <i className="fas fa-robot"></i>
    </div>
  );
};

export default Chatbot;
