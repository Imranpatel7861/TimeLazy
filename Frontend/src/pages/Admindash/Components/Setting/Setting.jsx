import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Setting.module.css';

const Setting = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    organization: '',
    phone: '',
    address: '',
    profilePic: null,
    profilePicURL: 'https://via.placeholder.com/100',
  });

  const navigate = useNavigate();

  // ✅ Load current profile on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      axios
        .get(`http://localhost:5000/api/profile?email=${storedEmail}`)
        .then((res) => {
          if (res.data) {
            setFormData((prev) => ({
              ...prev,
              name: res.data.name || '',
              email: res.data.email || '',
              gender: res.data.gender || '',
              organization: res.data.organization || '',
              phone: res.data.phone || '',
              address: res.data.address || '',
              profilePicURL: res.data.profile_pic || 'https://via.placeholder.com/100',
            }));

            // Store latest in localStorage for Admindash
            if (res.data.profile_pic) {
              localStorage.setItem('profileImage', res.data.profile_pic);
            }
            if (res.data.name) {
              localStorage.setItem('userName', res.data.name);
            }
            if (res.data.email) {
              localStorage.setItem('userEmail', res.data.email);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch profile:', err);
        });
    }
  }, []);

  const handleChangePasswordClick = () => {
    navigate('/ForgotPassword');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePhoto') {
      const file = files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          profilePic: file,
          profilePicURL: url,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('email', formData.email);
    payload.append('gender', formData.gender);
    payload.append('organization', formData.organization);
    payload.append('phone', formData.phone);
    payload.append('address', formData.address);
    if (formData.profilePic) {
      payload.append('profilePic', formData.profilePic);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/profile', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Changes saved!');

      // ✅ Update localStorage instantly for Admindash
      if (res.data && res.data.profile_pic) {
        localStorage.setItem('profileImage', res.data.profile_pic);
      }
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userEmail', formData.email);
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to save changes.');
    }
  };

  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.profileHeader}>
        <img
          src={formData.profilePicURL}
          alt="Profile"
          className={styles.avatar}
        />
        <div>
          <h2 className={styles.heading}>Profile Settings</h2>
          <p className={styles.subheading}>Manage your account information</p>
        </div>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <h3 className={styles.sectionTitle}>Personal Information</h3>

        <div className={styles.inputGroup}>
          <label htmlFor="profilePhoto">Profile Picture</label>
          <input
            type="file"
            name="profilePhoto"
            id="profilePhoto"
            accept="image/*"
            onChange={handleChange}
            className={styles.inputFile}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email ID"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Organization</label>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="Organization Name"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className={styles.input}
          />
        </div>

        <div className={styles.buttonRow}>
          <button type="submit" className={styles.saveBtn}>
            Save Changes
          </button>
          <button
            type="button"
            className={styles.passwordBtn}
            onClick={handleChangePasswordClick}
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default Setting;
