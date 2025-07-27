import React, { useState, useEffect } from 'react';
import styles from './AdminDash.module.css';

const AdminDash = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([
    { id: 1, name: 'Computer Science', code: 'CS', semester: '1st Year', credits: 4 },
    { id: 2, name: 'Mathematics', code: 'MATH', semester: '1st Year', credits: 3 },
    { id: 3, name: 'Physics', code: 'PHY', semester: '1st Year', credits: 3 }
  ]);

  const [faculty, setFaculty] = useState([
    { id: 1, name: 'Dr. Smith', department: 'Computer Science', email: 'smith@college.edu' },
    { id: 2, name: 'Prof. Johnson', department: 'Mathematics', email: 'johnson@college.edu' },
    { id: 3, name: 'Dr. Brown', department: 'Physics', email: 'brown@college.edu' }
  ]);

  const [rooms, setRooms] = useState([
    { id: 1, name: 'Room A101', capacity: 60, type: 'Lecture Hall' },
    { id: 2, name: 'Lab B201', capacity: 30, type: 'Computer Lab' },
    { id: 3, name: 'Room C301', capacity: 40, type: 'Classroom' }
  ]);

  const [timetable, setTimetable] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const timeSlots = ['9:40-10:30', '10:30-11:20', '11:20-12:10', '12:10-13:00', '13:40-14:30', '14:30-15:20', '15:20-16:00','16:00-5:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const initialTimetable = {};
    days.forEach(day => {
      initialTimetable[day] = {};
      timeSlots.forEach(slot => {
        initialTimetable[day][slot] = null;
      });
    });
    setTimetable(initialTimetable);
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSave = (type, data) => {
    if (type === 'course') {
      if (editingItem) {
        setCourses(courses.map(c => c.id === editingItem.id ? { ...data, id: editingItem.id } : c));
      } else {
        setCourses([...courses, { ...data, id: Date.now() }]);
      }
    } else if (type === 'faculty') {
      if (editingItem) {
        setFaculty(faculty.map(f => f.id === editingItem.id ? { ...data, id: editingItem.id } : f));
      } else {
        setFaculty([...faculty, { ...data, id: Date.now() }]);
      }
    } else if (type === 'room') {
      if (editingItem) {
        setRooms(rooms.map(r => r.id === editingItem.id ? { ...data, id: editingItem.id } : r));
      } else {
        setRooms([...rooms, { ...data, id: Date.now() }]);
      }
    }
    closeModal();
  };

  const handleDelete = (type, id) => {
    if (type === 'course') setCourses(courses.filter(c => c.id !== id));
    else if (type === 'faculty') setFaculty(faculty.filter(f => f.id !== id));
    else if (type === 'room') setRooms(rooms.filter(r => r.id !== id));
  };

  const generateAutoTimetable = () => {
    const newTimetable = {};
    days.forEach(day => {
      newTimetable[day] = {};
      timeSlots.forEach((slot, index) => {
        const courseIndex = Math.floor(Math.random() * courses.length);
        const facultyIndex = Math.floor(Math.random() * faculty.length);
        const roomIndex = Math.floor(Math.random() * rooms.length);

        newTimetable[day][slot] = {
          course: courses[courseIndex],
          faculty: faculty[facultyIndex],
          room: rooms[roomIndex]
        };
      });
    });
    setTimetable(newTimetable);
  };

  const FormModal = () => {
    const [formData, setFormData] = useState(editingItem || {});

    const handleSubmit = () => {
      handleSave(modalType, formData);
    };

    if (!showModal) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>
            {editingItem ? 'Edit' : 'Add'} {modalType}
          </h3>
          <div className={styles.formContainer}>
            {modalType === 'course' && (
              <>
                <input
                  type="text"
                  placeholder="Course Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="Course Code"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="Semester"
                  value={formData.semester || ''}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className={styles.input}
                  required
                />
                <input
                  type="number"
                  placeholder="Credits"
                  value={formData.credits || ''}
                  onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                  className={styles.input}
                  required
                />
              </>
            )}
            {modalType === 'faculty' && (
              <>
                <input
                  type="text"
                  placeholder="Faculty Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className={styles.input}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={styles.input}
                  required
                />
              </>
            )}
            {modalType === 'room' && (
              <>
                <input
                  type="text"
                  placeholder="Room Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={styles.input}
                  required
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="Room Type"
                  value={formData.type || ''}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className={styles.input}
                  required
                />
              </>
            )}
            <div className={styles.modalButtons}>
              <button onClick={handleSubmit} className={`${styles.btn} ${styles.btnPrimary}`}>
                Save
              </button>
              <button onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Admin Dashboard</h1>
          <div className={styles.headerUser}>
            <span className={styles.welcomeText}>Welcome Admin</span>
            <div className={styles.userAvatar}>A</div>
          </div>
        </div>
      </header>
      <div className={styles.mainLayout}>
        <nav className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.navItems}>
              {[
                { id: 'dashboard', label: 'Overview', icon: '📊' },
                { id: 'courses', label: 'Courses', icon: '📚' },
                { id: 'faculty', label: 'Faculty', icon: '👥' },
                { id: 'rooms', label: 'Rooms', icon: '🏢' },
                { id: 'timetable', label: 'Timetable', icon: '⏰' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
        <main className={styles.mainContent}>
          {activeTab === 'dashboard' && (
            <div>
              <h2 className={styles.pageTitle}>Overview</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <div>
                      <p className={styles.statLabel}>Total Courses</p>
                      <p className={styles.statValue}>{courses.length}</p>
                    </div>
                    <div className={styles.statIcon}>📚</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <div>
                      <p className={styles.statLabel}>Faculty Members</p>
                      <p className={styles.statValue}>{faculty.length}</p>
                    </div>
                    <div className={styles.statIcon}>👥</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <div>
                      <p className={styles.statLabel}>Available Rooms</p>
                      <p className={styles.statValue}>{rooms.length}</p>
                    </div>
                    <div className={styles.statIcon}>🏢</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <div>
                      <p className={styles.statLabel}>Time Slots</p>
                      <p className={styles.statValue}>{timeSlots.length}</p>
                    </div>
                    <div className={styles.statIcon}>⏰</div>
                  </div>
                </div>
              </div>
              <div className={styles.quickActions}>
                <h3 className={styles.sectionTitle}>Quick Actions</h3>
                <div className={styles.actionGrid}>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={styles.actionButton}
                  >
                    <div className={styles.actionIcon}>📚</div>
                    <span>Manage Courses</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('faculty')}
                    className={styles.actionButton}
                  >
                    <div className={styles.actionIcon}>👥</div>
                    <span>Manage Faculty</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={styles.actionButton}
                  >
                    <div className={styles.actionIcon}>🏢</div>
                    <span>Manage Rooms</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className={styles.actionButton}
                  >
                    <div className={styles.actionIcon}>📅</div>
                    <span>Generate Timetable</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'courses' && (
            <div>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Courses</h2>
                <button
                  onClick={() => openModal('course')}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  ➕ Add Course
                </button>
              </div>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Code</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td>{course.name}</td>
                        <td>{course.code}</td>
                        <td>{course.semester}</td>
                        <td>{course.credits}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => openModal('course', course)}
                              className={styles.editBtn}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete('course', course.id)}
                              className={styles.deleteBtn}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'faculty' && (
            <div>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Faculty</h2>
                <button
                  onClick={() => openModal('faculty')}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  ➕ Add Faculty
                </button>
              </div>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.map(member => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.department}</td>
                        <td>{member.email}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => openModal('faculty', member)}
                              className={styles.editBtn}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete('faculty', member.id)}
                              className={styles.deleteBtn}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'rooms' && (
            <div>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Rooms</h2>
                <button
                  onClick={() => openModal('room')}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  ➕ Add Room
                </button>
              </div>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Room Name</th>
                      <th>Capacity</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => (
                      <tr key={room.id}>
                        <td>{room.name}</td>
                        <td>{room.capacity}</td>
                        <td>{room.type}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => openModal('room', room)}
                              className={styles.editBtn}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete('room', room.id)}
                              className={styles.deleteBtn}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'timetable' && (
            <div>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Timetable Generator</h2>
                <div className={styles.headerButtons}>
                  <button
                    onClick={generateAutoTimetable}
                    className={`${styles.btn} ${styles.btnSuccess}`}
                  >
                    🎲 Auto Generate
                  </button>
                  <button className={`${styles.btn} ${styles.btnInfo}`}>
                    📥 Export
                  </button>
                </div>
              </div>
              <div className={styles.timetableContainer}>
                <div className={styles.timetableWrapper}>
                  <table className={styles.timetableTable}>
                    <thead>
                      <tr>
                        <th className={styles.timeColumn}>Time</th>
                        {days.map(day => (
                          <th key={day} className={styles.dayColumn}>
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(slot => (
                        <tr key={slot}>
                          <td className={styles.timeCell}>{slot}</td>
                          {days.map(day => (
                            <td key={`${day}-${slot}`} className={styles.scheduleCell}>
                              {timetable[day] && timetable[day][slot] ? (
                                <div className={styles.classCard}>
                                  <div className={styles.courseName}>
                                    {timetable[day][slot].course.name}
                                  </div>
                                  <div className={styles.facultyName}>
                                    {timetable[day][slot].faculty.name}
                                  </div>
                                  <div className={styles.roomName}>
                                    {timetable[day][slot].room.name}
                                  </div>
                                </div>
                              ) : (
                                <div className={styles.emptySlot}>Free</div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <FormModal />
    </div>
  );
};

export default AdminDash;
