import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Contact.css';
import {
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaPaperPlane, FaArrowLeft, FaSpinner
} from 'react-icons/fa';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({
      name: false,
      email: false,
      subject: false,
      message: false
    });

    let valid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = true;
      valid = false;
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = true;
      valid = false;
    }
    if (!formData.subject.trim()) {
      newErrors.subject = true;
      valid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = true;
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setIsSubmitting(true);
      try {
        const response = await fetch('http://localhost:5000/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
          setSubmitSuccess(true);
          setFormData({ name: '', email: '', subject: '', message: '' });
          setTimeout(() => setSubmitSuccess(false), 5000);
        } else {
          console.error('Failed to send message:', data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/Landing');
  };

  return (
    <div className="contact-container">
      <button onClick={handleBack} className="back-btn">
        <FaArrowLeft />
      </button>

      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <header className="header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to reach out.</p>
      </header>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Get in Touch</h2>

          <div className="info-item">
            <div className="info-icon"><FaMapMarkerAlt /></div>
            <div className="info-text">
              <h3>Our Location</h3>
              <p>TimeLazy, Pune, India</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><FaPhoneAlt /></div>
            <div className="info-text">
              <h3>Phone Number</h3>
              <p>7558278187</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><FaEnvelope /></div>
            <div className="info-text">
              <h3>Email Address</h3>
              <p>support@timelazy.com</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><FaClock /></div>
            <div className="info-text">
              <h3>Working Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM</p>
            </div>
          </div>

          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=61570261174985&mibextid=ZbWKwL" className="social-link" title="Facebook"><FaFacebookF /></a>
            <a href="https://x.com/incorbis?t=yRcNnKknmtATHWpOXWnA6w&s=09" className="social-link" title="Twitter"><FaTwitter /></a>
            <a href="https://www.instagram.com/incorbis.official?igsh=dXRhdzh5NGdlency" className="social-link" title="Instagram"><FaInstagram /></a>
            <a href="#" className="social-link" title="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>

        <div className="contact-form">
          {submitSuccess && (
            <div className="success-message">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}

          <form id="contactForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div className="error-message">Please enter your name</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="error-message">Please enter a valid email address</div>}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                className={`form-control ${errors.subject ? 'error' : ''}`}
                value={formData.subject}
                onChange={handleChange}
              />
              {errors.subject && <div className="error-message">Please enter a subject</div>}
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea
                id="message"
                className={`form-control ${errors.message ? 'error' : ''}`}
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              {errors.message && <div className="error-message">Please enter your message</div>}
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FaSpinner className="fa-spin" /> Sending...
                </>
              ) : (
                <>
                  Send Message <FaPaperPlane />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
