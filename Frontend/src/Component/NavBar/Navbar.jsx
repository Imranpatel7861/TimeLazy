
import React, { useState } from 'react';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.jpg';
import { Link } from 'react-router-dom';
import { useTheme } from '../Theme/ThemeContext'; // import the context

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // get theme and toggle

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className={styles.nav} id="mainNav">
      {/* Logo */}
      <div className={styles.logo}>
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
      </div>

      {/* Main Links */}
      <ul className={`${styles.navLinks} ${menuOpen ? styles.activeMenu : ''}`}>
        <li>
          Services <i className="fa-solid fa-angle-down"></i>
          <ul className={styles.dropdownMenu}>
            <li><Link to="/dashboard">AI Timetable</Link></li>
            <li><Link to="/planner">AI Planner</Link></li>
            <li><Link to="/organization">AI for Organization</Link></li>
            <li><Link to="/game">AI Game for Lazy Ones</Link></li>
            <li><Link to="/seating">AI Seating Planner</Link></li>
          </ul>
        </li>
        <li><Link to="/pricing">Pricing</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contactus">Contact</Link></li>
        <li>
          <span>
            Login <i className="fa-solid fa-angle-down"></i>
          </span>
          <ul className={styles.dropdownMenu}>
            <li><Link to="/LoginPer">Personal</Link></li>
            <li><Link to="/Loginad">Organization</Link></li>
          </ul>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button className={styles.mobileMenuBtn} onClick={toggleMenu}>☰</button>

      {/* Dark Mode Toggle */}
      <label className={styles.themeToggleSwitch}>
        <input
          type="checkbox"
          onChange={toggleTheme}
          checked={theme === 'dark'}
        />
        <span className={styles.slider}></span>
      </label>
    </nav>
  );
};

export default Navbar;
