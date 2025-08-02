import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/loginPer.module.css'; // Reusing the same styles

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleBack = () => {
    navigate('/Loginad');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.status === 200) {
        setMessage(data.message || 'Reset link sent to your email.');
      } else {
        setError(data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Server error. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.loginCard}>
        <button className={styles.backButton} onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={styles.header}>
          <div className={styles.avatar}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
              <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className={styles.title}>Forgot Password</h1>
          <p className={styles.subtitle}>We'll send a reset link to your email</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className={styles.input}
                required
              />
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}

          <button
            type="submit"
            className={`${styles.submitBtn} ${isSending ? styles.loading : ''}`}
            disabled={isSending}
          >
            {isSending ? <div className={styles.spinner}></div> : 'Send Reset Link'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Back to <a href="/Loginad" className={styles.signupLink}>Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
