import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../Theme/ThemeContext';
import logo from '../../assets/logo.jpg';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = (menu) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
  };

  // Theme-based styles
  const isDark = theme === 'dark';
  const colors = {
    navBg: isDark ? '#1e1e1e' : '#ffffff',
    navText: isDark ? '#f0f0f0' : '#333333',
    dropdownBg: isDark ? '#2c2c2c' : '#ffffff',
    dropdownHoverBg: isDark ? '#333333' : '#f8f9fa',
    dropdownHoverText: '#4a6cf7',
    shadow: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    toggleBg: isDark ? '#444' : '#ccc',
    toggleCheckedBg: '#4a6cf7'
  };

  return (
    <nav style={{
      backgroundColor: colors.navBg,
      boxShadow: `0 2px 10px ${colors.shadow}`,
      position: 'fixed',
      width: '80%',
      top: '0',
      left: '10%',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      boxSizing: 'border-box',
      borderRadius: '20px',
      marginTop: '0px'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/">
          <img src={logo} alt="Logo" style={{ height: '80px', width: 'auto' }} />
        </Link>
      </div>

      {/* Navigation Links */}
      <ul style={{
        display: menuOpen ? 'flex' : window.innerWidth <= 768 ? 'none' : 'flex',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        flexDirection: menuOpen ? 'column' : 'row',
        position: menuOpen ? 'absolute' : 'static',
        top: menuOpen ? '100%' : 'auto',
        left: menuOpen ? '0' : 'auto',
        width: menuOpen ? '100%' : 'auto',
        backgroundColor: menuOpen ? colors.navBg : 'transparent',
        boxShadow: menuOpen ? `0 2px 10px ${colors.shadow}` : 'none',
        borderRadius: menuOpen ? '0 0 20px 20px' : '0'
      }}>
        {/* Services Dropdown */}
        <li style={{
          marginLeft: menuOpen ? '0' : '2.5rem',
          position: 'relative',
          fontSize: 'larger',
          color: colors.navText,
          padding: menuOpen ? '0.5rem 1rem' : '0'
        }}>
          <span 
            onClick={() => toggleDropdown('services')}
            style={{
              color: colors.navText,
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              transition: 'all 0.3s',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseEnter={(e) => e.target.style.color = colors.dropdownHoverText}
            onMouseLeave={(e) => e.target.style.color = colors.navText}
          >
            Services <i className="fa-solid fa-angle-down"></i>
          </span>
          
          {/* Services Dropdown Menu */}
          {dropdownOpen === 'services' && (
            <ul style={{
              display: 'block',
              position: 'absolute',
              top: '100%',
              left: '0',
              backgroundColor: colors.dropdownBg,
              boxShadow: `0 4px 15px ${colors.shadow}`,
              borderRadius: '8px',
              zIndex: 1001,
              listStyle: 'none',
              padding: '0.75rem 0',
              minWidth: '220px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <li><Link to="/dashboard" style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: colors.navText,
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '400',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.dropdownHoverBg;
                e.target.style.color = colors.dropdownHoverText;
              }} onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.navText;
              }}>AI Timetable</Link></li>
              
              <li><Link to="/planner" style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: colors.navText,
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '400',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.dropdownHoverBg;
                e.target.style.color = colors.dropdownHoverText;
              }} onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.navText;
              }}>AI Planner</Link></li>
              
              <li><Link to="/organization" style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: colors.navText,
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '400',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.dropdownHoverBg;
                e.target.style.color = colors.dropdownHoverText;
              }} onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.navText;
              }}>AI for Organization</Link></li>
              
              <li><Link to="/game" style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: colors.navText,
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '400',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.dropdownHoverBg;
                e.target.style.color = colors.dropdownHoverText;
              }} onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.navText;
              }}>AI Game for Lazy Ones</Link></li>
              
              <li><Link to="/seating" style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: colors.navText,
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '400',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.dropdownHoverBg;
                e.target.style.color = colors.dropdownHoverText;
              }} onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.navText;
              }}>AI Seating Planner</Link></li>
            </ul>
          )}
        </li>

        {/* Regular Nav Items */}
        <li style={{
          marginLeft: menuOpen ? '0' : '2.5rem',
          fontSize: 'larger',
          color: colors.navText,
          padding: menuOpen ? '0.5rem 1rem' : '0'
        }}>
          <Link to="/pricing" style={{
            textDecoration: 'none',
            color: colors.navText,
            transition: 'all 0.3s',
            padding: '0.5rem 1rem',
            borderRadius: '5px'
          }} onMouseEnter={(e) => e.target.style.color = colors.dropdownHoverText}
             onMouseLeave={(e) => e.target.style.color = colors.navText}>
            Pricing
          </Link>
        </li>

        <li style={{
          marginLeft: menuOpen ? '0' : '2.5rem',
          fontSize: 'larger',
          color: colors.navText,
          padding: menuOpen ? '0.5rem 1rem' : '0'
        }}>
          <Link to="/about" style={{
            textDecoration: 'none',
            color: colors.navText,
            transition: 'all 0.3s',
            padding: '0.5rem 1rem',
            borderRadius: '5px'
          }} onMouseEnter={(e) => e.target.style.color = colors.dropdownHoverText}
             onMouseLeave={(e) => e.target.style.color = colors.navText}>
            About
          </Link>
        </li>

        <li style={{
          marginLeft: menuOpen ? '0' : '2.5rem',
          fontSize: 'larger',
          color: colors.navText,
          padding: menuOpen ? '0.5rem 1rem' : '0'
        }}>
          <Link to="/contactus" style={{
            textDecoration: 'none',
            color: colors.navText,
            transition: 'all 0.3s',
            padding: '0.5rem 1rem',
            borderRadius: '5px'
          }} onMouseEnter={(e) => e.target.style.color = colors.dropdownHoverText}
             onMouseLeave={(e) => e.target.style.color = colors.navText}>
            Contact
          </Link>
        </li>

        {/* Login Dropdown */}
        <li style={{
          marginLeft: menuOpen ? '0' : '2.5rem',
          position: 'relative',
          fontSize: 'larger',
          color: colors.navText,
          padding: menuOpen ? '0.5rem 1rem' : '0'
        }}>
          <span 
            onClick={() => toggleDropdown('login')}
            style={{
              color: colors.navText,
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              transition: 'all 0.3s',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseEnter={(e) => e.target.style.color = colors.dropdownHoverText}
            onMouseLeave={(e) => e.target.style.color = colors.navText}
          >
            Login <i className="fa-solid fa-angle-down"></i>
          </span>
          
          {/* Login Dropdown Menu */}
          {dropdownOpen === 'login' && (
            <ul style={{
              display: 'block',
              position: 'absolute',
              top: '100%',
              left: '0',
              backgroundColor: colors.dropdownBg,
              boxShadow: `0 4px 15px ${colors.shadow}`,
              borderRadius: '8px',
              zIndex: 1001,
              listStyle: 'none',
              padding: '0.75rem 0',
              minWidth: '220px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <li><Link to="/LoginPer" style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: colors.navText,
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '400',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.dropdownHoverBg;
                e.target.style.color = colors.dropdownHoverText;
              }} onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.navText;
              }}>Personal</Link></li>
              
              <li><Link to="/Loginad" style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                color: colors.navText,
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '400',
                whiteSpace: 'nowrap'
              }} onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.dropdownHoverBg;
                e.target.style.color = colors.dropdownHoverText;
              }} onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.navText;
              }}>Organization</Link></li>
            </ul>
          )}
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button 
        onClick={toggleMenu}
        style={{
          display: window.innerWidth <= 768 ? 'block' : 'none',
          background: 'none',
          border: 'none',
          fontSize: '2.5rem',
          cursor: 'pointer',
          color: colors.dropdownHoverText,
          zIndex: 101
        }}
      >
        ☰
      </button>

      {/* Theme Toggle Switch */}
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: '60px',
        height: '34px'
      }}>
        <input
          type="checkbox"
          onChange={toggleTheme}
          checked={theme === 'dark'}
          style={{
            opacity: 0,
            width: 0,
            height: 0
          }}
        />
        <span style={{
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme === 'dark' ? colors.toggleCheckedBg : colors.toggleBg,
          transition: '0.4s',
          borderRadius: '34px'
        }}>
          <span style={{
            position: 'absolute',
            content: '""',
            height: '26px',
            width: '26px',
            left: '4px',
            bottom: '4px',
            backgroundColor: 'white',
            transition: '0.4s',
            borderRadius: '50%',
            transform: theme === 'dark' ? 'translateX(26px)' : 'translateX(0px)'
          }}></span>
        </span>
      </label>
    </nav>
  );
};

export default Navbar;