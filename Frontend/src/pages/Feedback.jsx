import React, { useState } from 'react';
import { ArrowLeft, Lightbulb, Bug, Heart, Send, Loader } from 'lucide-react';
import styles from "../css/Feedback.module.css";

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: '',
    feedbackType: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your feedback';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setSuccessMessage(true);
        setFormData({
          name: '',
          email: '',
          rating: '',
          feedbackType: '',
          message: ''
        });
        setIsSubmitting(false);
        setTimeout(() => {
          setSuccessMessage(false);
        }, 5000);
      }, 1500);
    }
  };

  if (successMessage) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <Heart size={32} color="#10b981" />
          </div>
          <h2 className={styles.successTitle}>Thank You!</h2>
          <p className={styles.successText}>We appreciate you taking the time to help us improve TimeLazy.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.floatingShapes}>
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
        <div className={`${styles.shape} ${styles.shape3}`}></div>
        <div className={`${styles.shape} ${styles.shape4}`}></div>
      </div>
      <button onClick={() => window.history.back()} className={styles.backButton}>
        <ArrowLeft size={24} />
      </button>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.mainTitle}>Share Your Feedback</h1>
          <div className={styles.titleUnderline}></div>
          <p className={styles.headerDescription}>
            We value your opinion! Help us improve by sharing your experience with TimeLazy.
          </p>
        </header>
        <div className={styles.contentGrid}>
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Why Your Feedback Matters</h2>
              <p className={styles.infoDescription}>
                Your feedback helps us make planning and timetable management even better. Share your thoughts,
                suggestions, or issues — we're here to listen and improve TimeLazy for you.
              </p>
              <div className={styles.infoItems}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon} style={{ backgroundColor: '#f59e0b' }}>
                    <Lightbulb size={24} color="white" />
                  </div>
                  <div className={styles.infoText}>
                    <h3 className={styles.infoItemTitle}>Suggest Features</h3>
                    <p className={styles.infoItemDesc}>Tell us what features you'd like to see in future updates.</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon} style={{ backgroundColor: '#ef4444' }}>
                    <Bug size={24} color="white" />
                  </div>
                  <div className={styles.infoText}>
                    <h3 className={styles.infoItemTitle}>Report Issues</h3>
                    <p className={styles.infoItemDesc}>Help us identify and fix any problems you encounter.</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon} style={{ backgroundColor: '#8b5cf6' }}>
                    <Heart size={24} color="white" />
                  </div>
                  <div className={styles.infoText}>
                    <h3 className={styles.infoItemTitle}>Share Your Experience</h3>
                    <p className={styles.infoItemDesc}>Let us know what you love about TimeLazy.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formContainer}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.input}
                      style={{ borderColor: errors.name ? '#ef4444' : '#d1d5db' }}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className={styles.errorMessage}>⚠️ {errors.name}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.input}
                      style={{ borderColor: errors.email ? '#ef4444' : '#d1d5db' }}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className={styles.errorMessage}>⚠️ {errors.email}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>How would you rate your experience?</label>
                    <div className={styles.ratingContainer}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className={styles.ratingOption}>
                          <input
                            type="radio"
                            id={`rating-${num}`}
                            name="rating"
                            value={num}
                            checked={formData.rating === String(num)}
                            onChange={handleChange}
                            className={styles.radioInput}
                          />
                          <label
                            htmlFor={`rating-${num}`}
                            className={styles.ratingLabel}
                            style={{
                              backgroundColor: formData.rating === String(num) ? '#8b5cf6' : '#f3f4f6',
                              color: formData.rating === String(num) ? 'white' : '#6b7280',
                            }}
                          >
                            {num}
                          </label>
                          <span className={styles.ratingText}>
                            {num === 1 ? 'Poor' : num === 2 ? 'Fair' : num === 3 ? 'Good' : num === 4 ? 'Very Good' : 'Excellent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Type of Feedback</label>
                    <select
                      name="feedbackType"
                      value={formData.feedbackType}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Select feedback type</option>
                      <option value="suggestion">Feature Suggestion</option>
                      <option value="bug">Bug Report</option>
                      <option value="compliment">Compliment</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Your Feedback *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className={styles.textarea}
                      style={{ borderColor: errors.message ? '#ef4444' : '#d1d5db' }}
                      placeholder="Please share your thoughts, suggestions, or any issues you've encountered..."
                    />
                    {errors.message && <p className={styles.errorMessage}>⚠️ {errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitButton}
                    style={{
                      backgroundColor: isSubmitting ? '#9ca3af' : '#8b5cf6',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div className={styles.buttonContent}>
                      {isSubmitting ? (
                        <>
                          <Loader size={20} className={styles.spinner} />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Feedback</span>
                          <Send size={20} />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
