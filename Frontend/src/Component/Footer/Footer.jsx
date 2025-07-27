// Footer.jsx
import React, { useEffect } from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll(`.${styles.footerSection}`);
    const copyright = document.querySelector(`.${styles.copyright}`);

    sections.forEach((section) => observer.observe(section));
    if (copyright) observer.observe(copyright);

    return () => observer.disconnect();
  }, []);

  return (
    <footer className={styles.footerSection} id="footerSection">
      <div className={styles.footerContent}>
        {/* Company Info */}
        <div className={styles.footerSection}>
          <h3>TimeLazy</h3>
          <p>
            Providing innovative AI driven Timetables since 2025. We're dedicated
            to helping our customers succeed.
          </p>
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/profile.php?id=61570261174985&mibextid=ZbWKwL"><i className="fab fa-facebook-f"></i></a>
            <a href="https://x.com/incorbis?t=yRcNnKknmtATHWpOXWnA6w&s=09"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
            <a href="https://www.instagram.com/incorbis.official?igsh=dXRhdzh5NGdlency"><i className="fab fa-instagram"></i></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.footerSection}>
          <h3>Quick Links</h3>
          <ul className={styles.footerLinks}>
            <li><a href="#">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="/ContactUs">Contact</a></li>
          </ul>
        </div>

        {/* Services */}
        <div className={styles.footerSection}>
          <h3>Services</h3>
          <ul className={styles.footerLinks}>
            <li><a href="/dashboard">AI TimeTable</a></li>
            <li><a href="#">AI Planner</a></li>
            <li><a href="#">AI Seating Planner</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.footerSection}>
          <h3>Contact Us</h3>
          <p>Email: support@timelazy.com</p>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; 2025 AI TimeTabler. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;