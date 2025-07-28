import React from 'react';
import {
  BookOpen,
  Users,
  Calendar,
  Plus,
  Eye
} from 'lucide-react';
import styles from './Overview.module.css'; // Make sure to create & style this module file

const Overview = () => {
  const stats = [
    { title: 'Total Classes', value: '248', change: '+12%', icon: BookOpen, color: 'blue' },
    { title: 'Active Teachers', value: '45', change: '+5%', icon: Users, color: 'green' },
    { title: 'Students', value: '1,247', change: '+8%', icon: Users, color: 'purple' },
    { title: 'Schedules', value: '18', change: '+2%', icon: Calendar, color: 'orange' }
  ];

  const recentActivities = [
    { action: 'New timetable created', time: '2 hours ago', type: 'create' },
    { action: 'Math class rescheduled', time: '4 hours ago', type: 'edit' },
    { action: 'Teacher profile updated', time: '6 hours ago', type: 'update' },
    { action: 'Student enrolled', time: '1 day ago', type: 'add' }
  ];

  const upcomingClasses = [
    { subject: 'Mathematics', teacher: 'Dr. Smith', time: '10:00 AM', room: 'A-101', students: 45 },
    { subject: 'Physics', teacher: 'Prof. Johnson', time: '11:30 AM', room: 'B-205', students: 38 },
    { subject: 'Chemistry', teacher: 'Dr. Williams', time: '2:00 PM', room: 'C-301', students: 42 },
    { subject: 'Biology', teacher: 'Ms. Brown', time: '3:30 PM', room: 'D-102', students: 40 }
  ];

  const quickActions = [
    { label: 'Create Timetable', icon: Plus, color: 'blue' },
    { label: 'Add Teacher', icon: Users, color: 'green' },
    { label: 'Schedule Class', icon: Calendar, color: 'purple' },
    { label: 'View Reports', icon: Eye, color: 'orange' }
  ];

  return (
    <div className={styles.overviewContent}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`${styles.statCard} ${styles[`statCard${stat.color.charAt(0).toUpperCase() + stat.color.slice(1)}`]}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statTitle}>{stat.title}</p>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.statChange}>{stat.change}</p>
                </div>
                <div className={`${styles.statIcon} ${styles[`icon${stat.color.charAt(0).toUpperCase() + stat.color.slice(1)}`]}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.contentGrid}>
        {/* Upcoming Classes */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Today's Classes</h3>
            <button className={styles.viewAllBtn}>View All</button>
          </div>
          <div className={styles.cardContent}>
            {upcomingClasses.map((class_, index) => (
              <div key={index} className={styles.classItem}>
                <div className={styles.classInfo}>
                  <h4 className={styles.classSubject}>{class_.subject}</h4>
                  <p className={styles.classDetails}>{class_.teacher} • Room {class_.room}</p>
                </div>
                <div className={styles.classTime}>
                  <p className={styles.timeText}>{class_.time}</p>
                  <p className={styles.studentsText}>{class_.students} students</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Activities</h3>
            <button className={styles.viewAllBtn}>View All</button>
          </div>
          <div className={styles.cardContent}>
            {recentActivities.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles[`dot${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`]}`}></div>
                <div className={styles.activityContent}>
                  <p className={styles.activityAction}>{activity.action}</p>
                  <p className={styles.activityTime}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.contentCard}>
        <h3 className={styles.cardTitle}>Quick Actions</h3>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button key={action.label} className={styles.quickAction}>
                <div className={`${styles.quickActionIcon} ${styles[`icon${action.color.charAt(0).toUpperCase() + action.color.slice(1)}`]}`}>
                  <Icon size={20} />
                </div>
                <span className={styles.quickActionLabel}>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Overview;
