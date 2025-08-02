import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/loginPer.module.css';

const LoginPer = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/personal/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.status === 200) {
        console.log('✅ Personal Login Successful:', data);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Server error. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/Landing');
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
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Log in to your personal account</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
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

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={styles.input}
                required
              />
              <div className={styles.inputIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19L9.9 4.24z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles.options}>
            <label className={styles.checkbox}>
              <input type="checkbox" />
              <span className={styles.checkmark}></span>
              Remember me
            </label>
            <a href="#" className={styles.forgotLink}>Forgot password?</a>
          </div>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

          <button
            type="submit"
            className={`${styles.submitBtn} ${isLoading ? styles.loading : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Or continue with</span>
        </div>

        <div className={styles.socialButtons}>
          <button className={styles.socialBtn}>
            {/* Google Icon */}
            Google
          </button>
          <button className={styles.socialBtn}>
            {/* Facebook Icon */}
            Facebook
          </button>
        </div>

        <div className={styles.footer}>
          <p>Don't have an account? <a href="/SignupPer" className={styles.signupLink}>Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPer;
