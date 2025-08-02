import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/SignupPer.module.css';

const SignupPer = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/personal/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setSignupSuccess(true);
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Server error');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
        <div className={styles.shape4}></div>
      </div>

      <div className={styles.signupCard}>
        {signupSuccess ? (
          <div className={styles.successMessage}>
            <h2 className={styles.successTitle}>✅ Signup Successful</h2>
            <p className={styles.successText}>You can now login to your account.</p>
            <button className={styles.submitBtn} onClick={() => navigate('/loginPer')}>
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <button className={styles.backButton} onClick={handleBackToLanding}>
              ←
            </button>

            <div className={styles.header}>
              <div className={styles.avatar}>
                👤
              </div>
              <h1 className={styles.title}>Create Account</h1>
              <p className={styles.subtitle}>Join us and start your journey</p>

              <div className={styles.progressBar}>
                <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>1</span>
                  <span className={styles.stepLabel}>Personal Info</span>
                </div>
                <div className={styles.progressLine}>
                  <div className={`${styles.progressFill} ${currentStep >= 2 ? styles.complete : ''}`}></div>
                </div>
                <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepLabel}>Security</span>
                </div>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.inputRow}>
                    <input
                      type="text"
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                  <button type="button" className={styles.nextBtn} onClick={handleNextStep}>
                    Continue →
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                    />
                    I agree to the Terms & Privacy Policy
                  </label>

                  <div className={styles.buttonGroup}>
                    <button type="button" className={styles.backBtn} onClick={handlePrevStep}>
                      ← Back
                    </button>
                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className={styles.divider}>Or sign up with</div>

            <div className={styles.socialButtons}>
              <button className={styles.socialBtn}>Google</button>
              <button className={styles.socialBtn}>Facebook</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupPer;
