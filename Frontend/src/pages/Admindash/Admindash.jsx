import React, { useState } from 'react';
import {
  Calendar,
  Users,
  BookOpen,
  Clock,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import styles from './Admindash.module.css';

import Overview from './Components/Overview/Overview';
// import Timetable from './Components/Timetable/Timetable';
import Teacher from './Components/Teacher/Teacher';
import Student from './Components/Student/Student';
import Setting from './Components/Setting/Setting';
import Seating from './Components/Seating/Seating';
import Classes from './Components/Classes/Classes';
import Lab from './Components/Lab/Lab';

const Admindash = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>EduAdmin</h1>
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

        {/* Signup Button */}
        <div className={styles.sidebarFooter}>
          <button
            className={styles.signupBtn}
            onClick={() => {
              window.location.href = '/Landing'; // or use navigation logic
            }}
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
              <h2 className={styles.pageTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button className={styles.notificationBtn}>
                <Bell size={20} />
                {notifications > 0 && (
                  <span className={styles.notificationBadge}>{notifications}</span>
                )}
              </button>
              <div className={styles.profileSection}>
                <div className={styles.avatar}><span>A</span></div>
                <ChevronDown size={16} className={styles.dropdownIcon} />
              </div>
            </div>
          </div>
        </header>

        <main className={styles.mainArea}>
          {activeTab === 'overview' && <Overview />}
          {/* {activeTab === 'timetables' && <Timetable />} */}
          {activeTab === 'teachers' && <Teacher />}
          {activeTab === 'students' && <Student />}
          {activeTab === 'classes' && <Classes />}
          {activeTab === 'lab' && <Lab />}
          {activeTab === 'seating' && <Seating />}
          {activeTab === 'settings' && <Setting />}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default Admindash;
