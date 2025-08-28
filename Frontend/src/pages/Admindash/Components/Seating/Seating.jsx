import React, { useState } from 'react';
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

  // Helper function to format roll number
  const formatRollNumber = (level, divisionName, roll) => {
    const paddedRoll = roll.toString().padStart(2, '0');
    return `${level}${divisionName}${paddedRoll}`;
  };

  // Progress calculation
  const getProgressPercentage = () => {
    if (currentStep === 1) {
      const classroomProgress = classroomCount > 0 ? 25 : 0;
      const detailsProgress = classrooms.every(room => room.name && room.benches) ? 25 : 0;
      return classroomProgress + detailsProgress;
    } else {
      const divisionsSet = Object.values(divisionCounts).some(count => count > 0) ? 25 : 0;
      const detailsFilled = Object.entries(studentData).every(([level, data]) => {
        return data.subject.trim() && data.divisions.every(div => div.name.trim() && div.start && div.end);
      }) ? 25 : 0;
      return 50 + divisionsSet + detailsFilled;
    }
  };

  // Classroom handlers
  const handleClassroomCountChange = (e) => {
    const count = parseInt(e.target.value, 10) || 0;
    setClassroomCount(count);
    const newClassrooms = Array.from({ length: count }, (_, i) => ({
      name: `Classroom ${i + 1}`,
      benches: '',
    }));
    setClassrooms(newClassrooms);
  };

  const handleClassroomChange = (index, field, value) => {
    const updated = [...classrooms];
    updated[index][field] = value;
    setClassrooms(updated);
  };

  // Student data handlers
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

  // Utility functions
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

  // Validation
  const canProceedToStep2 = () => {
    return classroomCount > 0 && classrooms.every(room => room.name.trim() && room.benches) && examDate && examTimeFrom && examTimeTo;
  };

  const canGeneratePDF = () => {
    const hasStudents = Object.values(divisionCounts).some(count => count > 0);
    const allFieldsFilled = Object.entries(studentData).every(([level, data]) => {
      return data.subject.trim() && data.divisions.every(div => div.name.trim() && div.start && div.end);
    });
    return hasStudents && allFieldsFilled && getTotalStudents() <= getTotalBenches();
  };

  // Assign students to benches
  const assignStudentsToBenches = () => {
    try {
      const totalBenches = getTotalBenches();
      const totalStudents = getTotalStudents();
      if (totalStudents > totalBenches) {
        alert("Total students exceed available benches!");
        return [];
      }

      let arrangement = [];
      let currentBench = 1;
      let currentClassroomIndex = 0;

      Object.entries(studentData).forEach(([level, data]) => {
        data.divisions.forEach((div) => {
          const start = parseInt(div.start, 10);
          const end = parseInt(div.end, 10);
          for (let roll = start; roll <= end; roll++) {
            const classroom = classrooms[currentClassroomIndex];
            const rollInDivision = roll - start + 1;
            const formattedRoll = formatRollNumber(level, div.name, rollInDivision);
            arrangement.push({
              year: level,
              rollNumber: formattedRoll,
              division: div.name,
              subject: data.subject,
              classroom: classroom.name,
              bench: currentBench,
            });
            currentBench++;
            if (currentBench > parseInt(classroom.benches, 10)) {
              currentBench = 1;
              currentClassroomIndex++;
            }
          }
        });
      });

      setSeatingArrangement(arrangement);
      return arrangement;
    } catch (error) {
      console.error("Error assigning students to benches:", error);
      alert("Error assigning students to benches. Check console for details.");
      return [];
    }
  };

  // Generate PDF
  const generatePDF = () => {
    try {
      const arrangement = assignStudentsToBenches();
      if (!arrangement.length) {
        alert("No valid seating arrangement generated. Check your inputs.");
        return;
      }

      const doc = new jsPDF();

      // Header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Pimpri Chinchwad Education Trust's", 105, 10, { align: "center" });
      doc.text("Pimpri Chinchwad College of Engineering & Research, Ravet, Pune", 105, 17, { align: "center" });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Academic Year: 2025-26 Term - I`, 14, 27);
      doc.text(`Examination: SPPU In-Sem 2025-26`, 14, 34);
      doc.text(`Date: ${examDate}   Time: ${examTimeFrom} - ${examTimeTo}`, 14, 41);

      // Years with students
      const yearsWithStudents = Object.keys(studentData).filter(
        (level) => studentData[level].divisions.length > 0
      );
      doc.text(`Years: ${yearsWithStudents.join(", ")}`, 14, 48);

      // Block Summary Table
      doc.setFont("helvetica", "bold");
      doc.text("Block Summary", 14, 57);

      // Prepare block summary data
      const blockSummary = [];
      let blockNumber = 1;
      let currentBlockClassroom = null;
      let currentBlockStart = null;
      let currentBlockEnd = null;
      let currentBlockTotal = 0;
      let divisionRolls = {};

      arrangement.forEach((item, index) => {
        if (index === 0) {
          currentBlockClassroom = item.classroom;
          currentBlockStart = item.rollNumber;
          currentBlockEnd = item.rollNumber;
          currentBlockTotal = 1;
          divisionRolls[item.division] = { start: item.rollNumber, end: item.rollNumber };
        } else {
          if (item.classroom === currentBlockClassroom) {
            currentBlockEnd = item.rollNumber;
            currentBlockTotal++;

            if (!divisionRolls[item.division]) {
              divisionRolls[item.division] = { start: item.rollNumber, end: item.rollNumber };
            } else {
              divisionRolls[item.division].end = item.rollNumber;
            }
          } else {
            const divisionRows = Object.entries(divisionRolls).map(([division, rolls]) => [
              blockNumber,
              currentBlockClassroom,
              division,
              rolls.start,
              rolls.end,
              rolls.end.split(division)[1] - rolls.start.split(division)[1] + 1,
            ]);

            blockSummary.push(...divisionRows);

            blockNumber++;
            currentBlockClassroom = item.classroom;
            currentBlockStart = item.rollNumber;
            currentBlockEnd = item.rollNumber;
            currentBlockTotal = 1;
            divisionRolls = { [item.division]: { start: item.rollNumber, end: item.rollNumber } };
          }
        }

        if (index === arrangement.length - 1) {
          const divisionRows = Object.entries(divisionRolls).map(([division, rolls]) => [
            blockNumber,
            currentBlockClassroom,
            division,
            rolls.start,
            rolls.end,
            rolls.end.split(division)[1] - rolls.start.split(division)[1] + 1,
          ]);

          blockSummary.push(...divisionRows);
        }
      });

      autoTable(doc, {
        head: [["Block Number", "Classroom", "Division", "Roll No. From", "Roll No. To", "Total"]],
        body: blockSummary,
        startY: 60,
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

      // Footer on the first page
      const firstPageFooterY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Prepared by: Exam Cell`, 14, firstPageFooterY);
      doc.text(`Total Students: ${getTotalStudents()}`, 160, firstPageFooterY, { align: "right" });

      // Seating Arrangement by Classroom (each classroom on a new page)
      classrooms.forEach((classroom) => {
        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Seating Arrangement for ${classroom.name}`, 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Total Benches: ${classroom.benches}`, 105, 30, { align: "center" });

        const classroomArrangement = arrangement.filter(item => item.classroom === classroom.name);
        const seatingData = classroomArrangement.map(item => [
          item.year,
          item.rollNumber,
          item.division,
          item.subject,
          item.bench,
        ]);

        autoTable(doc, {
          head: [["Year", "Roll Number", "Division", "Subject", "Bench"]],
          body: seatingData,
          startY: 40,
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
      });

      // Save the PDF
      doc.save("Exam_Seating_Arrangement.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Check console for details.");
    }
  };

  // Render
  const totalBenches = getTotalBenches();
  const totalStudents = getTotalStudents();
  const progressPercentage = getProgressPercentage();

  return (
    <div className={styles.container}>
      <div className={styles.printHidden}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FileText className={styles.titleIcon} />
            Exam Seating Arrangement System
          </h1>
          <p className={styles.subtitle}>Create organized seating arrangements for your examinations</p>
        </div>

        {/* Progress Bar */}
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

        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepIcon} ${currentStep >= 1 ? styles.activeStepIcon : ''}`}>
            <MapPin size={20} />
          </div>
          <div className={`${styles.stepLine} ${currentStep >= 2 ? styles.activeStepLine : ''}`}></div>
          <div className={`${styles.stepIcon} ${currentStep >= 2 ? styles.activeStepIcon : ''}`}>
            <Users size={20} />
          </div>
        </div>

        {/* Step Content */}
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
                      <input
                        type="text"
                        placeholder="e.g., Room A-101"
                        value={room.name}
                        onChange={(e) => handleClassroomChange(index, 'name', e.target.value)}
                        className={styles.input}
                      />
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
                <div className={`${styles.summaryCard} ${totalStudents > totalBenches ? styles.errorCard : styles.successCard}`}>
                  <div className={styles.summaryIcon}>
                    {totalStudents > totalBenches ? (
                      <AlertTriangle className={styles.errorIcon} size={20} />
                    ) : (
                      <Users className={styles.successIcon} size={20} />
                    )}
                  </div>
                  <p className={styles.summaryText}>
                    Total Students: <span className={styles.summaryNumber}>{totalStudents}</span> / {totalBenches} Benches
                  </p>
                  {totalStudents > totalBenches && (
                    <p className={styles.errorText}>
                      ⚠️ Total students exceed available benches! Please add more classrooms or reduce student count.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
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

        {/* Print Preview */}
        <div className={styles.printOnly}>
          <h1 className={styles.printTitle}>Exam Seating Arrangement</h1>
          <div className={styles.printSection}>
            <h2 className={styles.printSectionTitle}>Classroom Details</h2>
            <div className={styles.printGrid}>
              {classrooms.map((room, i) => (
                <div key={i} className={styles.printCard}>
                  <div className={styles.printCardTitle}>{room.name}</div>
                  <div className={styles.printCardText}>Benches: {room.benches}</div>
                </div>
              ))}
            </div>
            <div className={styles.printSummaryCard}>
              <div className={styles.printSummaryText}>
                Total Benches: {totalBenches}
              </div>
            </div>
          </div>
          <div>
            <h2 className={styles.printSectionTitle}>Student Distribution</h2>
            {['SE', 'TE', 'BE'].map((level) => (
              <div key={level} className={styles.printDivisionSection}>
                <h3 className={styles.printDivisionTitle}>{level} Students:</h3>
                <div className={styles.printSubjectText}>Subject: {studentData[level].subject}</div>
                <div className={styles.printGrid}>
                  {studentData[level].divisions.map((div, i) => (
                    <div key={i} className={styles.printDivisionCard}>
                      <div className={styles.printDivisionCardTitle}>{div.name}</div>
                      <div className={styles.printDivisionCardText}>Roll No.: {div.start} - {div.end}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className={styles.printSummaryCard}>
              <div className={styles.printSummaryText}>
                Total Students: {totalStudents}
              </div>
            </div>
          </div>
          <div className={styles.printFooter}>
            Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seating;
