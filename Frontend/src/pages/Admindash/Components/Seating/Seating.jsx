import React, { useState, useEffect } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  FileText,
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react';
import styles from './Seating.module.css';
import pccoerLogoLeft from '../../../../assets/leftlogo.png';
import pccoerLogoRight from '../../../../assets/rightlogo.png';

const Seating = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [classroomCount, setClassroomCount] = useState(0);
  const [classrooms, setClassrooms] = useState([]);
  const [studentData, setStudentData] = useState({
    SE: { divisions: [], subject: '' },
    TE: { divisions: [], subject: '' },
    BE: { divisions: [], subject: '' },
  });
  const [divisionCounts, setDivisionCounts] = useState({
    SE: 0,
    TE: 0,
    BE: 0,
  });
  const [seatingArrangement, setSeatingArrangement] = useState([]);
  const [examDate, setExamDate] = useState('');
  const [examTimeFrom, setExamTimeFrom] = useState('');
  const [examTimeTo, setExamTimeTo] = useState('');
  const [seatingMode, setSeatingMode] = useState("one");
  const [allClassrooms, setAllClassrooms] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  // Fetch supervisors and classrooms from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supervisorsResponse, classroomsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/supervisors'),
          fetch('http://localhost:5000/api/classrooms')
        ]);

        const supervisorsData = await supervisorsResponse.json();
        const classroomsData = await classroomsResponse.json();

        setSupervisors(supervisorsData);
        setAllClassrooms(classroomsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatRollNumber = (level, divisionName, roll) => {
    const paddedRoll = roll.toString().padStart(2, '0');
    return `${level}${divisionName}${paddedRoll}`;
  };

  const getProgressPercentage = () => {
    if (currentStep === 1) {
      const classroomProgress = classroomCount > 0 ? 25 : 0;
      const detailsProgress = classrooms.every(room => room.name && room.benches && room.supervisor) ? 25 : 0;
      return classroomProgress + detailsProgress;
    } else {
      const divisionsSet = Object.values(divisionCounts).some(count => count > 0) ? 25 : 0;
      const detailsFilled = Object.entries(studentData).every(([level, data]) => {
        return data.subject.trim() && data.divisions.every(div => div.name.trim() && div.start && div.end);
      }) ? 25 : 0;
      return 50 + divisionsSet + detailsFilled;
    }
  };

  const handleClassroomCountChange = (e) => {
    const count = parseInt(e.target.value, 10) || 0;
    setClassroomCount(count);
    const newClassrooms = Array.from({ length: count }, (_, i) => ({
      name: '',
      benches: '',
      supervisor: '',
    }));
    setClassrooms(newClassrooms);
  };

  const handleClassroomChange = (index, field, value) => {
    const updated = [...classrooms];
    updated[index][field] = value;
    setClassrooms(updated);
  };

  const handleDivisionCountChange = (level, value) => {
    const count = parseInt(value, 10) || 0;
    setDivisionCounts((prev) => ({ ...prev, [level]: count }));
    const newDivisions = Array.from({ length: count }, () => ({
      name: '',
      start: '',
      end: '',
    }));
    setStudentData((prev) => ({ ...prev, [level]: { ...prev[level], divisions: newDivisions } }));
  };

  const handleDivisionDataChange = (level, index, field, value) => {
    const updatedDivisions = [...studentData[level].divisions];
    updatedDivisions[index][field] = value;
    setStudentData((prev) => ({ ...prev, [level]: { ...prev[level], divisions: updatedDivisions } }));
  };

  const handleSubjectChange = (level, value) => {
    setStudentData((prev) => ({ ...prev, [level]: { ...prev[level], subject: value } }));
  };

  const getTotalBenches = () =>
    classrooms.reduce((sum, room) => sum + parseInt(room.benches || 0, 10), 0);

  const getTotalStudents = () => {
    let total = 0;
    Object.entries(studentData).forEach(([_, data]) => {
      data.divisions.forEach((div) => {
        const start = parseInt(div.start || 0, 10);
        const end = parseInt(div.end || 0, 10);
        if (end >= start) {
          total += end - start + 1;
        }
      });
    });
    return total;
  };

  const canProceedToStep2 = () => {
    return classroomCount > 0 && classrooms.every(room => room.name && room.benches && room.supervisor) && examDate && examTimeFrom && examTimeTo;
  };

  const canGeneratePDF = () => {
    const hasStudents = Object.values(divisionCounts).some(count => count > 0);
    const allFieldsFilled = Object.entries(studentData).every(([level, data]) => {
      return data.subject.trim() && data.divisions.every(div => div.name.trim() && div.start && div.end);
    });
    return hasStudents && allFieldsFilled && getTotalStudents() <= getTotalBenches() * (seatingMode === "one" ? 1 : 2);
  };

  const assignStudentsToBenches = () => {
    try {
      const totalBenches = getTotalBenches();
      const totalStudents = getTotalStudents();
      if (totalStudents > totalBenches * (seatingMode === "one" ? 1 : 2)) {
        alert(`Total students exceed available benches for ${seatingMode === "one" ? "one" : "two"} student(s) per bench!`);
        return [];
      }
      let arrangement = [];
      let currentBench = 1;
      let currentClassroomIndex = 0;
      let allStudents = [];
      Object.entries(studentData).forEach(([level, data]) => {
        data.divisions.forEach((div) => {
          const start = parseInt(div.start, 10);
          const end = parseInt(div.end, 10);
          for (let roll = start; roll <= end; roll++) {
            const rollInDivision = roll - start + 1;
            const formattedRoll = formatRollNumber(level, div.name, rollInDivision);
            allStudents.push({
              year: level,
              rollNumber: formattedRoll,
              division: div.name,
              subject: data.subject,
            });
          }
        });
      });
      if (seatingMode === "one") {
        allStudents.forEach((student) => {
          const classroom = classrooms[currentClassroomIndex];
          arrangement.push({
            year: student.year,
            rollNumber: student.rollNumber,
            division: student.division,
            subject: student.subject,
            classroom: classroom.name,
            supervisor: classroom.supervisor,
            bench: currentBench,
          });
          currentBench++;
          if (currentBench > parseInt(classroom.benches, 10)) {
            currentBench = 1;
            currentClassroomIndex++;
          }
        });
      } else {
        const seStudents = [...allStudents.filter(s => s.year === "SE")];
        const teStudents = [...allStudents.filter(s => s.year === "TE")];
        const beStudents = [...allStudents.filter(s => s.year === "BE")];
        let pairedArrangement = [];
        let currentBench = 1;
        let currentClassroomIndex = 0;
        const findPartner = (student, availableStudents) => {
          return availableStudents.find(s =>
            s.year !== student.year || (s.year === student.year && s.division !== student.division)
          );
        };
        while (seStudents.length > 0) {
          const classroom = classrooms[currentClassroomIndex];
          const student1 = seStudents.shift();
          let student2 = findPartner(student1, [...teStudents, ...beStudents]);
          if (!student2 && (teStudents.length > 0 || beStudents.length > 0)) {
            student2 = teStudents.length > 0 ? teStudents.shift() : beStudents.shift();
          }
          pairedArrangement.push({
            year: student1.year,
            rollNumber: student1.rollNumber,
            division: student1.division,
            subject: student1.subject,
            classroom: classroom.name,
            supervisor: classroom.supervisor,
            bench: currentBench,
            partner: student2 ? {
              year: student2.year,
              rollNumber: student2.rollNumber,
              division: student2.division,
              subject: student2.subject,
            } : null,
          });
          if (student2) {
            if (student2.year === "TE") {
              const index = teStudents.findIndex(s => s.rollNumber === student2.rollNumber);
              if (index !== -1) teStudents.splice(index, 1);
            } else if (student2.year === "BE") {
              const index = beStudents.findIndex(s => s.rollNumber === student2.rollNumber);
              if (index !== -1) beStudents.splice(index, 1);
            }
          }
          currentBench++;
          if (currentBench > parseInt(classroom.benches, 10)) {
            currentBench = 1;
            currentClassroomIndex++;
          }
        }
        while (teStudents.length > 0) {
          const classroom = classrooms[currentClassroomIndex];
          const student1 = teStudents.shift();
          let student2 = findPartner(student1, [...seStudents, ...beStudents]);
          if (!student2 && (seStudents.length > 0 || beStudents.length > 0)) {
            student2 = seStudents.length > 0 ? seStudents.shift() : beStudents.shift();
          }
          pairedArrangement.push({
            year: student1.year,
            rollNumber: student1.rollNumber,
            division: student1.division,
            subject: student1.subject,
            classroom: classroom.name,
            supervisor: classroom.supervisor,
            bench: currentBench,
            partner: student2 ? {
              year: student2.year,
              rollNumber: student2.rollNumber,
              division: student2.division,
              subject: student2.subject,
            } : null,
          });
          if (student2) {
            if (student2.year === "SE") {
              const index = seStudents.findIndex(s => s.rollNumber === student2.rollNumber);
              if (index !== -1) seStudents.splice(index, 1);
            } else if (student2.year === "BE") {
              const index = beStudents.findIndex(s => s.rollNumber === student2.rollNumber);
              if (index !== -1) beStudents.splice(index, 1);
            }
          }
          currentBench++;
          if (currentBench > parseInt(classroom.benches, 10)) {
            currentBench = 1;
            currentClassroomIndex++;
          }
        }
        while (beStudents.length > 0) {
          const classroom = classrooms[currentClassroomIndex];
          const student1 = beStudents.shift();
          let student2 = findPartner(student1, [...seStudents, ...teStudents]);
          if (!student2 && (seStudents.length > 0 || teStudents.length > 0)) {
            student2 = seStudents.length > 0 ? seStudents.shift() : teStudents.shift();
          }
          pairedArrangement.push({
            year: student1.year,
            rollNumber: student1.rollNumber,
            division: student1.division,
            subject: student1.subject,
            classroom: classroom.name,
            supervisor: classroom.supervisor,
            bench: currentBench,
            partner: student2 ? {
              year: student2.year,
              rollNumber: student2.rollNumber,
              division: student2.division,
              subject: student2.subject,
            } : null,
          });
          if (student2) {
            if (student2.year === "SE") {
              const index = seStudents.findIndex(s => s.rollNumber === student2.rollNumber);
              if (index !== -1) seStudents.splice(index, 1);
            } else if (student2.year === "TE") {
              const index = teStudents.findIndex(s => s.rollNumber === student2.rollNumber);
              if (index !== -1) teStudents.splice(index, 1);
            }
          }
          currentBench++;
          if (currentBench > parseInt(classroom.benches, 10)) {
            currentBench = 1;
            currentClassroomIndex++;
          }
        }
        arrangement = pairedArrangement;
      }
      setSeatingArrangement(arrangement);
      return arrangement;
    } catch (error) {
      console.error("Error assigning students to benches:", error);
      alert("Error assigning students to benches. Check console for details.");
      return [];
    }
  };

  const buildBlockSummaryRows = (arrangement) => {
    const blockSummaryMap = {};
    arrangement.forEach(item => {
      const key = `${item.year}-${item.division}`;
      if (!blockSummaryMap[key]) {
        blockSummaryMap[key] = {
          year: item.year,
          division: item.division,
          rollNumbers: [],
          rooms: {}
        };
      }
      blockSummaryMap[key].rollNumbers.push(item.rollNumber);
      if (!blockSummaryMap[key].rooms[item.classroom]) {
        blockSummaryMap[key].rooms[item.classroom] = {
          supervisor: item.supervisor,
          rollNumbers: []
        };
      }
      blockSummaryMap[key].rooms[item.classroom].rollNumbers.push(item.rollNumber);
      if (seatingMode === "two" && item.partner) {
        const partnerKey = `${item.partner.year}-${item.partner.division}`;
        if (!blockSummaryMap[partnerKey]) {
          blockSummaryMap[partnerKey] = {
            year: item.partner.year,
            division: item.partner.division,
            rollNumbers: [],
            rooms: {}
          };
        }
        blockSummaryMap[partnerKey].rollNumbers.push(item.partner.rollNumber);
        if (!blockSummaryMap[partnerKey].rooms[item.classroom]) {
          blockSummaryMap[partnerKey].rooms[item.classroom] = {
            supervisor: item.supervisor,
            rollNumbers: []
          };
        }
        blockSummaryMap[partnerKey].rooms[item.classroom].rollNumbers.push(item.partner.rollNumber);
      }
    });
    const blockSummary = [];
    let blockNumber = 1;
    for (const key in blockSummaryMap) {
      const { year, division, rooms } = blockSummaryMap[key];
      for (const room in rooms) {
        const { supervisor, rollNumbers } = rooms[room];
        rollNumbers.sort((a, b) => {
          const aNum = parseInt(a.match(/\d+$/)[0], 10);
          const bNum = parseInt(b.match(/\d+$/)[0], 10);
          return aNum - bNum;
        });
        if (rollNumbers.length > 0) {
          const start = rollNumbers[0];
          const end = rollNumbers[rollNumbers.length - 1];
          const specialization = `${year}${division}`;
          blockSummary.push([
            blockNumber++,
            room,
            supervisor,
            specialization,
            `${start} to ${end}`,
          ]);
        }
      }
    }
    blockSummary.sort((a, b) => {
      if (a[3] === b[3]) return a[1].localeCompare(b[1]);
      return a[3].localeCompare(b[3]);
    });
    return blockSummary;
  };

  const generatePDF = () => {
    try {
      const arrangement = assignStudentsToBenches();
      if (!arrangement.length) {
        alert("No valid seating arrangement generated. Check your inputs.");
        return;
      }
      const doc = new jsPDF();
      const addHeader = (classroomName = '') => {
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(10, 5, 190, 35);
        doc.setFontSize(10);
        doc.addImage(pccoerLogoLeft, 'PNG', 15, 10, 25, 20);
        doc.addImage(pccoerLogoRight, 'PNG', 170, 10, 25, 20);
        doc.setFont("helvetica", "bold");
        doc.text("Pimpri Chinchwad Education Trust's", 105, 15, { align: "center" });
        doc.text("Pimpri Chinchwad College of Engineering & Research, Ravet, Pune", 105, 20, { align: "center" });
        doc.text("IQAC PCCOER", 105, 25, { align: "center" });
        doc.setFontSize(9);
        doc.text(`Academic Year: 2025-26`, 20, 35);
        doc.text(`Term I`, 105, 35, { align: "center" });
        doc.text(`PIXEL CRAFT - PCCOER`, 180, 35, { align: "right" });
        if (classroomName) {
          doc.setFontSize(12);
          doc.text(`Seating Arrangement for ${classroomName}`, 105, 45, { align: "center" });
        }
      };
      addHeader();
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Examination: SPPU In-Sem 2025-26`, 14, 50);
      doc.text(`Date: ${examDate}   Time: ${examTimeFrom} - ${examTimeTo}`, 14, 57);
      const yearsWithStudents = Object.keys(studentData).filter(
        (level) => studentData[level].divisions.length > 0
      );
      doc.text(`Years: ${yearsWithStudents.join(", ")}`, 14, 64);
      doc.setFont("helvetica", "bold");
      doc.text("Block Summary", 14, 71);
      const blockSummary = buildBlockSummaryRows(arrangement);
      const tableHeaders = [["Block Number", "Room", "Supervisor", "Specialization", "Roll No. Range"]];
      autoTable(doc, {
        head: tableHeaders,
        body: blockSummary,
        startY: 75,
        styles: {
          fontSize: 9,
          halign: 'center',
          cellPadding: 1.5,
          cellWidth: 'wrap',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: 255,
          halign: 'center',
        },
        bodyStyles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
      });
      const firstPageFooterY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Prepared by: Exam Cell`, 14, firstPageFooterY);
      doc.text(`Total Students: ${getTotalStudents()}`, 160, firstPageFooterY, { align: "right" });
      classrooms.forEach((classroom) => {
        doc.addPage();
        addHeader(classroom.name);
        const classroomArrangement = arrangement.filter(item => item.classroom === classroom.name);
        const seatingData = classroomArrangement.map(item => {
          if (seatingMode === "one") {
            return [
              item.year,
              item.rollNumber,
              item.division,
              item.subject,
              item.bench,
            ];
          } else {
            return [
              item.year,
              item.rollNumber,
              item.division,
              item.subject,
              item.bench,
              item.partner ? item.partner.rollNumber : "-",
              item.partner ? item.partner.division : "-",
            ];
          }
        });
        autoTable(doc, {
          head: seatingMode === "one"
            ? [["Year", "Roll Number", "Division", "Subject", "Bench"]]
            : [["Year", "Roll Number", "Division", "Subject", "Bench", "Partner", "Partner's Division"]],
          body: seatingData,
          startY: 55,
          styles: {
            fontSize: 8,
            halign: 'center',
            cellPadding: 1.5,
            cellWidth: 'wrap',
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [0, 150, 136],
            textColor: 255,
            halign: 'center',
          },
          bodyStyles: {
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
        });
        const classroomStudents = seatingMode === "one"
          ? classroomArrangement.length
          : classroomArrangement.reduce((acc, itm) => acc + 1 + (itm.partner ? 1 : 0), 0);
        const lastTableY = doc.lastAutoTable.finalY;
        doc.setFontSize(10);
        doc.text(`Supervisor: ${classroom.supervisor || 'N/A'}`, 14, lastTableY + 10);
        doc.text(`Total Benches: ${classroom.benches}`, 14, lastTableY + 17);
        doc.text(`Total Students: ${classroomStudents}`, 14, lastTableY + 24);
      });
      doc.save("Exam_Seating_Arrangement.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Check console for details.");
    }
  };

  const totalBenches = getTotalBenches();
  const totalStudents = getTotalStudents();
  const progressPercentage = getProgressPercentage();

  return (
    <div className={styles.container}>
      <div className={styles.printHidden}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FileText className={styles.titleIcon} />
            Exam Seating Arrangement System
          </h1>
          <p className={styles.subtitle}>Create organized seating arrangements for your examinations</p>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <h3 className={styles.progressTitle}>Setup Progress</h3>
            <span className={styles.progressPercent}>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className={styles.progressSteps}>
            <span className={currentStep === 1 ? styles.activeStep : ''}>Step 1: Classroom Setup</span>
            <span className={currentStep === 2 ? styles.activeStep : ''}>Step 2: Student Data</span>
          </div>
        </div>
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepIcon} ${currentStep >= 1 ? styles.activeStepIcon : ''}`}>
            <MapPin size={20} />
          </div>
          <div className={`${styles.stepLine} ${currentStep >= 2 ? styles.activeStepLine : ''}`}></div>
          <div className={`${styles.stepIcon} ${currentStep >= 2 ? styles.activeStepIcon : ''}`}>
            <Users size={20} />
          </div>
        </div>
        <div className={styles.content}>
          {currentStep === 1 ? (
            <div>
              <h2 className={styles.stepTitle}>
                <MapPin className={styles.stepTitleIcon} />
                Step 1: Classroom Configuration
              </h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Calendar size={16} /> Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.timeInputs}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Clock size={16} /> Time From
                  </label>
                  <input
                    type="time"
                    value={examTimeFrom}
                    onChange={(e) => setExamTimeFrom(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Clock size={16} /> Time To
                  </label>
                  <input
                    type="time"
                    value={examTimeTo}
                    onChange={(e) => setExamTimeTo(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Number of Classrooms
                </label>
                <input
                  type="number"
                  value={classroomCount}
                  onChange={handleClassroomCountChange}
                  className={styles.input}
                  placeholder="Enter number of classrooms"
                  min="1"
                />
              </div>
              {classrooms.map((room, index) => (
                <div key={index} className={styles.classroomCard}>
                  <h4 className={styles.classroomTitle}>Classroom {index + 1}</h4>
                  <div className={styles.classroomGrid}>
                    <div>
                      <label className={styles.label}>Classroom Name</label>
                      <select
                        value={room.name}
                        onChange={(e) => handleClassroomChange(index, 'name', e.target.value)}
                        className={styles.input}
                      >
                        <option value="">Select Classroom</option>
                        {allClassrooms.map((classroom) => (
                          <option key={classroom.id} value={classroom.name}>
                            {classroom.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Supervisor</label>
                      <select
                        value={room.supervisor}
                        onChange={(e) => handleClassroomChange(index, 'supervisor', e.target.value)}
                        className={styles.input}
                      >
                        <option value="">Select Supervisor</option>
                        {supervisors.map((supervisor) => (
                          <option key={supervisor.id} value={supervisor.name}>
                            {supervisor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Number of Benches</label>
                      <input
                        type="number"
                        placeholder="Enter bench count"
                        value={room.benches}
                        onChange={(e) => handleClassroomChange(index, 'benches', e.target.value)}
                        className={styles.input}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {classroomCount > 0 && (
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>
                    <MapPin className={styles.summaryIconSvg} size={20} />
                  </div>
                  <p className={styles.summaryText}>
                    Total Benches: <span className={styles.summaryNumber}>{totalBenches}</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className={styles.stepTitle}>
                <Users className={styles.stepTitleIcon} />
                Step 2: Student Information
              </h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Seating Mode</label>
                <div className={styles.toggleContainer}>
                  <button
                    className={`${styles.toggleButton} ${seatingMode === "one" ? styles.activeToggle : ""}`}
                    onClick={() => setSeatingMode("one")}
                  >
                    One Student per Bench
                  </button>
                  <button
                    className={`${styles.toggleButton} ${seatingMode === "two" ? styles.activeToggle : ""}`}
                    onClick={() => setSeatingMode("two")}
                  >
                    Two Students per Bench
                  </button>
                </div>
              </div>
              {['SE', 'TE', 'BE'].map((level) => (
                <div key={level} className={styles.divisionSection}>
                  <h3 className={styles.divisionTitle}>{level} Divisions</h3>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Subject</label>
                    <input
                      type="text"
                      placeholder={`Subject for ${level}`}
                      value={studentData[level].subject}
                      onChange={(e) => handleSubjectChange(level, e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Number of {level} Divisions
                    </label>
                    <input
                      type="number"
                      placeholder={`Number of ${level} divisions`}
                      value={divisionCounts[level]}
                      onChange={(e) => handleDivisionCountChange(level, e.target.value)}
                      className={styles.input}
                      min="0"
                    />
                  </div>
                  {studentData[level].divisions.map((div, index) => (
                    <div key={index} className={styles.divisionCard}>
                      <h5 className={styles.divisionCardTitle}>{level} Division {index + 1}</h5>
                      <div className={styles.divisionGrid}>
                        <input
                          type="text"
                          placeholder="Division Name (e.g., A)"
                          value={div.name}
                          onChange={(e) => handleDivisionDataChange(level, index, 'name', e.target.value)}
                          className={styles.input}
                        />
                        <input
                          type="number"
                          placeholder="Start Roll No."
                          value={div.start}
                          onChange={(e) => handleDivisionDataChange(level, index, 'start', e.target.value)}
                          className={styles.input}
                          min="1"
                        />
                        <input
                          type="number"
                          placeholder="End Roll No."
                          value={div.end}
                          onChange={(e) => handleDivisionDataChange(level, index, 'end', e.target.value)}
                          className={styles.input}
                          min="1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {totalStudents > 0 && (
                <div className={`${styles.summaryCard} ${totalStudents > totalBenches * (seatingMode === "one" ? 1 : 2) ? styles.errorCard : styles.successCard}`}>
                  <div className={styles.summaryIcon}>
                    {totalStudents > totalBenches * (seatingMode === "one" ? 1 : 2) ? (
                      <AlertTriangle className={styles.errorIcon} size={20} />
                    ) : (
                      <Users className={styles.successIcon} size={20} />
                    )}
                  </div>
                  <p className={styles.summaryText}>
                    Total Students: <span className={styles.summaryNumber}>{totalStudents}</span> / {totalBenches * (seatingMode === "one" ? 1 : 2)} Benches
                  </p>
                  {totalStudents > totalBenches * (seatingMode === "one" ? 1 : 2) && (
                    <p className={styles.errorText}>
                      ⚠️ Total students exceed available benches for {seatingMode === "one" ? "one" : "two"} student(s) per bench! Please add more classrooms or reduce student count.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.navigation}>
          <button
            onClick={() => setCurrentStep(1)}
            disabled={currentStep === 1}
            className={styles.navButton}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <div className={styles.navButtonGroup}>
            {currentStep === 1 ? (
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2()}
                className={styles.nextButton}
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={generatePDF}
                disabled={!canGeneratePDF()}
                className={styles.generateButton}
              >
                <FileText size={20} />
                Generate PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seating;
