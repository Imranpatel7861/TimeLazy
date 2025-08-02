import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/signupad.module.css';

const Signupad = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationId: '',
    adminFirstName: '',
    adminLastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `${formData.adminFirstName} ${formData.adminLastName}`,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.status === 201) {
        console.log("✅ Signup successful:", data);
        setSignupSuccess(true);
      } else {
        console.log("❌ Signup failed:", data);
        alert(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setSignupSuccess(false);
    setCurrentStep(1);
    setFormData({
      organizationName: '',
      organizationId: '',
      adminFirstName: '',
      adminLastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    });
  };

  const handleBackToLanding = () => {
    navigate('/admindash');
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
            <div className={styles.successIcon}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#4facfe" />
                <path d="M8 12L10.5 14.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Account Created Successfully!</h2>
            <p className={styles.successText}>
              Thank you for signing up, {formData.adminFirstName}! Your organization account has been created successfully.
              We've sent a verification email to <strong>{formData.email}</strong>.
              Please check your inbox and click the verification link to activate your account.
            </p>
            <p className={styles.successSubtext}>
              If you don't see the email, please check your spam folder or{' '}
              <button className={styles.resendLink} onClick={() => alert('Resend email functionality would be implemented here')}>
                click here to resend it
              </button>.
            </p>
            <div className={styles.successButtonGroup}>
              <button className={styles.backToFormBtn} onClick={handleBackToForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Form
              </button>
              <button className={styles.successButton} onClick={() => setSignupSuccess(false)}>
                Continue to Dashboard
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <button className={styles.backButton} onClick={handleBackToLanding}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            
            </button>

            {currentStep > 1 && (
              <button className={styles.backButton} onClick={handlePrevStep}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
              </button>
            )}

            <div className={styles.header}>
              <div className={styles.avatar}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h1 className={styles.title}>Create Organization Account</h1>
              <p className={styles.subtitle}>Join us and start your journey</p>

              <div className={styles.progressBar}>
                <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>1</span>
                  <span className={styles.stepLabel}>Organization Info</span>
                </div>
                <div className={styles.progressLine}>
                  <div className={`${styles.progressFill} ${currentStep >= 2 ? styles.complete : ''}`}></div>
                </div>
                <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepLabel}>Admin Info</span>
                </div>
                <div className={styles.progressLine}>
                  <div className={`${styles.progressFill} ${currentStep >= 3 ? styles.complete : ''}`}></div>
                </div>
                <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepLabel}>Security</span>
                </div>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        placeholder="Organization Name"
                        className={styles.input}
                        required
                      />
                      <div className={styles.inputIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        name="organizationId"
                        value={formData.organizationId}
                        onChange={handleInputChange}
                        placeholder="Organization ID"
                        className={styles.input}
                        required
                      />
                      <div className={styles.inputIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={handleNextStep}
                  >
                    Continue
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          name="adminFirstName"
                          value={formData.adminFirstName}
                          onChange={handleInputChange}
                          placeholder="First Name"
                          className={styles.input}
                          required
                        />
                        <div className={styles.inputIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          name="adminLastName"
                          value={formData.adminLastName}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          className={styles.input}
                          required
                        />
                        <div className={styles.inputIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

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
                          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" />
                          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={handleNextStep}
                  >
                    Continue
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
              )}

              {currentStep === 3 && (
                <div className={styles.stepContent}>
                  <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create password"
                        className={styles.input}
                        required
                      />
                      <div className={styles.inputIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="16" r="1" fill="currentColor" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z" stroke="currentColor" strokeWidth="2" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19L9.9 4.24z" stroke="currentColor" strokeWidth="2" />
                            <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        className={styles.input}
                        required
                      />
                      <div className={styles.inputIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" />
                          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z" stroke="currentColor" strokeWidth="2" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19L9.9 4.24z" stroke="currentColor" strokeWidth="2" />
                            <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={styles.termsSection}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                      />
                      <span className={styles.checkmark}></span>
                      I agree to the <a href="#" className={styles.link}>Terms of Service</a> and <a href="#" className={styles.link}>Privacy Policy</a>
                    </label>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={handlePrevStep}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Back
                    </button>

                    <button
                      type="submit"
                      className={`${styles.submitBtn} ${isLoading ? styles.loading : ''}`}
                      disabled={isLoading || !formData.agreeToTerms}
                    >
                      {isLoading ? (
                        <div className={styles.spinner}></div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className={styles.divider}>
              <span>Or sign up with</span>
            </div>

            <div className={styles.socialButtons}>
              <button className={styles.socialBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button className={styles.socialBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            <div className={styles.footer}>
              <p>Already have an account? <a href="#" className={styles.loginLink}>Sign in</a></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signupad;
