import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/loginPer.module.css'; // Reuse the same styles

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const email = query.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await res.json();
      if (res.status === 200) {
        setMessage('Password successfully updated!');
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        <div className={styles.header}>
          <div className={styles.avatar}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
              <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your new password below</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className={styles.input}
              required
            />
          </div>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}

          <button
            type="submit"
            className={`${styles.submitBtn} ${isSubmitting ? styles.loading : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? <div className={styles.spinner}></div> : 'Update Password'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Back to <a href="/Loginad" className={styles.signupLink}>Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
