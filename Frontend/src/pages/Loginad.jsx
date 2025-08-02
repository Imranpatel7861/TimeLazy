import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/loginad.module.css';
import ForgotPassword from './ForgotPassword';
const Loginad = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log("🔁 Server Response:", response.status, data);

      if (response.status === 200 && data.message === "Login successful") {
        console.log("✅ Login success:", data);
        navigate('/admindash');
      } else {
        setErrors({ submit: data.message || "Login failed" });
      }

    } catch (error) {
      console.error("❌ Server error:", error);
      setErrors({ submit: "Server error. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <button className={styles.backButton} onClick={() => navigate('/landing')}>

          <svg viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>Admin Login</h1>
          <p className={styles.subtitle}>Access your organization dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="admin@organization.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.options}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className={styles.checkbox}
                disabled={isLoading}
              />
              <span className={styles.checkmark}></span>
              Remember me
            </label>
            <a href="/ForgotPassword" className={styles.forgotPassword}>Forgot Password?</a>
          </div>

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Logging In...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Don't have account? <a href="/Signupad" className={styles.supportLink}>Signup</a></p>
        </div>
      </div>
    </div>
  );
};

export default Loginad;
