// Admindash.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar,
  Users,
  BookOpen,
  Clock,
  Settings,
  Menu,
  X
} from 'lucide-react';
import styles from './Admindash.module.css';

import Overview from './Components/Overview/Overview';
import Teacher from './Components/Teacher/Teacher';
import Student from './Components/Student/Student';
import Setting from './Components/Setting/Setting';
import Seating from './Components/Seating/Seating';
import Classes from './Components/Classes/Classes';
import Lab from './Components/Lab/Lab';

const Admindash = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    image: null
  });
  const [dashboardData, setDashboardData] = useState(null);

  const token = localStorage.getItem('token');

  // Load profile on mount
  useEffect(() => {
    if (!token) {
      window.location.href = '/loginad';
      return;
    }

    fetch('http://localhost:5000/api/personal/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = '/loginad';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;

        let imageUrl = null;
        if (data.profile_pic) {
          imageUrl = data.profile_pic.startsWith('http')
            ? data.profile_pic
            : `http://localhost:5000/uploads/${data.profile_pic}`;
        }

        const updatedProfile = {
          name: data.name || 'Admin',
          email: data.email || '',
          image: imageUrl
        };

        localStorage.setItem('userName', updatedProfile.name);
        localStorage.setItem('userEmail', updatedProfile.email);
        if (updatedProfile.image) {
          localStorage.setItem('profileImage', updatedProfile.image);
        }

        setProfile(updatedProfile);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        localStorage.clear();
        window.location.href = '/loginad';
      });
  }, [token]);

  // Fetch dashboard data on activeTab change
  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/dashboard?tab=${activeTab}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDashboardData(res.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response && error.response.status === 401) {
          localStorage.clear();
          window.location.href = '/loginad';
        }
      }
    };

    fetchDashboardData();
  }, [activeTab, token]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'teachers', label: 'Faculty Management', icon: Users },
    { id: 'students', label: 'Students Management', icon: Users },
    { id: 'classes', label: 'Classroom Management', icon: BookOpen },
    { id: 'lab', label: 'Lab Management', icon: BookOpen },
    { id: 'timetables', label: 'TimeLazy AI', icon: Clock },
    { id: 'seating', label: 'Seating Planner', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/Landing';
  };

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>Admin</h1>
          <button onClick={() => setSidebarOpen(false)} className={`${styles.closeBtn} lg:hidden`}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navigation}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
              >
                <Icon size={20} className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.signupBtn}
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button onClick={() => setSidebarOpen(true)} className={`${styles.menuBtn} lg:hidden`}>
                <Menu size={20} />
              </button>
              <h2 className={styles.pageTitle}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.profileSection}>
                <div className={styles.avatar}>
                  {profile.image ? (
                    <img src={profile.image} alt="Profile" className={styles.avatarImg} />
                  ) : (
                    <span>{profile.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.mainArea}>
          {activeTab === 'overview' && <Overview data={dashboardData} />}
          {activeTab === 'teachers' && <Teacher data={dashboardData} />}
          {activeTab === 'students' && <Student data={dashboardData} />}
          {activeTab === 'classes' && <Classes data={dashboardData} />}
          {activeTab === 'lab' && <Lab data={dashboardData} />}
          {activeTab === 'seating' && <Seating data={dashboardData} />}
          {activeTab === 'settings' && <Setting />}
        </main>
      </div>

      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default Admindash;
