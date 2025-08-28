import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import styles from './Timetable.module.css';

const initialSubject = {
  code: '',
  name: '',
  faculty: [''],
  type: 'Theory',
  room_type: 'Theory',
  duration: 50,
  min_per_week: 3,
  max_per_week: 5,
  required_room: '',
  batches: [],
  is_mentor: false
};

const initialRoom = {
  name: '',
  type: 'Theory',
  capacity: 30,
};

const initialFaculty = {
  abbr: '',
  name: '',
  max_per_day: 5,
  max_per_week: 25,
  availability: [0, 1, 2, 3, 4],
};

const initialFormData = {
  university: '',
  department: '',
  academic_year: '',
  term: '',
  effective_from: '',
  effective_to: '',
  divisions: [{ name: '', batches: [''] }],
  faculty: [{ ...initialFaculty }],
  rooms: [{ ...initialRoom }],
  subjects: [{ ...initialSubject }],
};

const TIME_SLOTS = [
  "08:50-09:40",
  "09:40-10:30",
  "10:30-11:20",
  "11:20-12:10",
  "12:10-01:00",
  "01:00-01:40",
  "01:40-02:30",
  "02:30-03:20",
  "03:20-04:10"
];

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [mentorBatches, setMentorBatches] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => {
    setUndoStack(prev => [...prev, formData]);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFormDataArray = (key, index, field, value) => {
    setUndoStack(prev => [...prev, formData]);
    const updated = [...formData[key]];
    updated[index][field] = value;
    setFormData({ ...formData, [key]: updated });
  };

  const handleDivisionChange = (index, value) => {
    setUndoStack(prev => [...prev, formData]);
    const updated = [...formData.divisions];
    updated[index].name = value;
    setFormData({ ...formData, divisions: updated });
  };

  const handleBatchChange = (divIndex, batchIndex, value) => {
    setUndoStack(prev => [...prev, formData]);
    const updated = [...formData.divisions];
    updated[divIndex].batches[batchIndex] = value;
    setFormData({ ...formData, divisions: updated });
  };

  const addToArray = (key, template) => {
    setUndoStack(prev => [...prev, formData]);
    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], { ...template }],
    }));
  };

  const addDivision = () => {
    addToArray('divisions', { name: '', batches: [''] });
  };

  const addBatchToDivision = (divIndex) => {
    setUndoStack(prev => [...prev, formData]);
    const updated = [...formData.divisions];
    updated[divIndex].batches.push('');
    setFormData({ ...formData, divisions: updated });
  };

  const handleSubjectChange = (index, field, value) => {
    updateFormDataArray('subjects', index, field, value);
  };

  const addSubject = () => {
    addToArray('subjects', initialSubject);
  };

  const addBatchToSubject = (subjectIndex) => {
    setUndoStack(prev => [...prev, formData]);
    const updated = [...formData.subjects];
    updated[subjectIndex].batches = updated[subjectIndex].batches || [];
    updated[subjectIndex].batches.push({ name: '', faculty: '', room: '' });
    setFormData({ ...formData, subjects: updated });
  };

  const handleLabBatchChange = (subjectIndex, batchIndex, field, value) => {
    setUndoStack(prev => [...prev, formData]);
    const updated = [...formData.subjects];
    updated[subjectIndex].batches[batchIndex][field] = value;
    setFormData({ ...formData, subjects: updated });
  };

  const handleRoomChange = (index, field, value) => {
    updateFormDataArray('rooms', index, field, field === 'capacity' ? parseInt(value) || 0 : value);
  };

  const handleFacultyChange = (index, field, value) => {
    const val = field === 'availability'
      ? value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
      : value;
    updateFormDataArray('faculty', index, field, val);
  };

  const addRoom = () => {
    addToArray('rooms', initialRoom);
  };

  const addFaculty = () => {
    addToArray('faculty', initialFaculty);
  };

  const undoLastChange = () => {
    if (undoStack.length > 0) {
      const previous = undoStack[undoStack.length - 1];
      setUndoStack(undoStack.slice(0, -1));
      setFormData(previous);
    }
  };

  const resetForm = () => {
    setUndoStack(prev => [...prev, formData]);
    setFormData(initialFormData);
    setMentorBatches([]);
    setGeneratedTimetable(null);
  };

  const validateForm = () => {
    const { university, department, divisions, subjects, rooms, faculty } = formData;
    if (!university || !department) return false;
    if (!divisions.length || !subjects.length || !rooms.length || !faculty.length) return false;
    return true;
  };

  const handleMentorBatchChange = (index, field, value) => {
    const updated = [...mentorBatches];
    if (field === 'roll_range') {
      if (!updated[index].roll_range) updated[index].roll_range = ['', ''];
      updated[index].roll_range[value.index] = value.val;
    } else {
      updated[index][field] = value;
    }
    setMentorBatches(updated);
  };

  const addMentorBatch = () => {
    setMentorBatches(prev => [...prev, {
      division: '',
      batch: '',
      mentor: '',
      roll_range: ['', '']
    }]);
  };

  const removeMentorBatch = (index) => {
    setMentorBatches(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      alert('❌ Please fill in all required fields.');
      return;
    }
    setLoading(true);

    let finalMentorBatches = mentorBatches.length > 0 ? mentorBatches : [];
    if (finalMentorBatches.length === 0) {
      formData.divisions.forEach(div => {
        (div.batches || []).forEach(batch => {
          finalMentorBatches.push({
            batch,
            division: div.name,
            mentor: "TBD",
            roll_range: [`${batch}-01`, `${batch}-30`]
          });
        });
      });
    }
    const payload = {
      ...formData,
      mentor_batches: finalMentorBatches
    };
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setGeneratedTimetable(data.timetable.divisions || data.timetable || {});
        setMentorBatches(finalMentorBatches);
      } else {
        alert('❌ Error generating timetable: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('❌ Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const findBatchGrid = (batch) => {
    if (!generatedTimetable) return null;

    for (const divData of Object.values(generatedTimetable)) {
      if (divData.batches && divData.batches[batch]) {
        const batchSchedule = divData.batches[batch];
        const grid = [];

        DAY_NAMES.forEach(dayName => {
          if (batchSchedule[dayName]) {
            const daySlots = batchSchedule[dayName];
            if (Array.isArray(daySlots)) {
              const dayRow = daySlots.map((slot, index) => {
                if (index === 5 && (slot === "LUNCH BREAK" || slot === "01:00-01:40")) {
                  return "LUNCH\nBREAK";
                }
                if (slot && slot !== "-") {
                  const parts = slot.split('\n');
                  if (parts.length >= 2) {
                    return `${parts[0]}\n${parts[1]}`;
                  }
                  return slot;
                }
                return '';
              });
              grid.push(dayRow);
            }
          }
        });
        return grid.length > 0 ? grid : null;
      }
    }
    return null;
  };

  const getDivisionBatchGrids = (divisionName) => {
    if (!generatedTimetable || !generatedTimetable[divisionName]) return {};

    const division = formData.divisions.find(d => d.name === divisionName);
    if (!division) return {};

    const batchGrids = {};
    division.batches.forEach(batch => {
      const grid = findBatchGrid(batch);
      if (grid) {
        batchGrids[batch] = grid;
      }
    });

    return batchGrids;
  };

  const exportDivisionToPDF = (divisionName) => {
    const doc = new jsPDF('l');
    const division = formData.divisions.find(d => d.name === divisionName);
    const batches = division ? division.batches : [];

    if (batches.length === 0) {
      alert('No batches found for this division');
      return;
    }

    const batchGrids = getDivisionBatchGrids(divisionName);

    if (Object.keys(batchGrids).length === 0) {
      alert('No timetable data found for this division');
      return;
    }

    let currentY = 16;

    if (logoFile) {
      doc.addImage(logoFile, 'PNG', 20, 5, 30, 15);
      doc.addImage(logoFile, 'PNG', 240, 5, 30, 15);
      currentY = 35;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formData.university || 'PIMPRI CHINCHWAD EDUCATION TRUST\'S', 148, 15, { align: 'center' });
    doc.text((formData.department || 'Department Name') + ', ' + (formData.university || 'College Name'), 148, 25, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Academic Year: ${formData.academic_year || '2025-26'}`, 20, 35);
    doc.text(`Term: ${formData.term || '1'}`, 20, 42);
    doc.text('Class Time Table', 148, 42, { align: 'center' });
    doc.text(`Record No.: ${divisionName}DIV${new Date().getFullYear()}`, 240, 35);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 240, 42);

    doc.setFontSize(12);
    doc.text(`Department: ${formData.department || 'Computer Engineering'}`, 20, 55);
    doc.text(`Class: ${formData.academic_year?.split('-')[0] || 'TE'} ${formData.department?.split(' ')[0] || 'Computer'}`, 120, 55);
    doc.text(`Div: ${divisionName}`, 200, 55);
    doc.text(`w.e.f - ${formData.effective_from || new Date().toLocaleDateString('en-GB')}`, 240, 55);

    const tableHeaders = ['Day\\Time', ...TIME_SLOTS];
    const tableBody = [];

    DAY_NAMES.forEach((dayName, dayIndex) => {
      const dayRow = [dayName];

      TIME_SLOTS.forEach((timeSlot, slotIndex) => {
        if (slotIndex === 5) {
          dayRow.push('LUNCH\nBREAK');
          return;
        }

        const slotActivities = [];

        batches.forEach(batch => {
          const grid = batchGrids[batch];
          if (grid && grid[dayIndex] && grid[dayIndex][slotIndex]) {
            const activity = grid[dayIndex][slotIndex];
            if (activity && activity !== '' && activity !== 'LUNCH\nBREAK') {
              const parts = activity.split('\n');
              if (parts.length >= 2) {
                slotActivities.push(`${parts[0]}(${parts[1]})-${batch}`);
              } else {
                slotActivities.push(`${activity}-${batch}`);
              }
            }
          }
        });

        dayRow.push(slotActivities.length > 0 ? slotActivities.join('\n') : '');
      });

      tableBody.push(dayRow);
    });

    autoTable(doc, {
      startY: currentY + 10,
      head: [tableHeaders],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [220, 53, 69],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'center',
        valign: 'middle',
        cellPadding: 2,
        minCellHeight: 20
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        cellPadding: 2
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          fillColor: [220, 53, 69],
          textColor: [255, 255, 255],
          halign: 'center'
        },
        6: {
          fillColor: [255, 193, 7],
          fontStyle: 'bold'
        }
      },
      didDrawCell: function(data) {
        if (data.column.index === 6) {
          doc.setFillColor(255, 193, 7);
        }
      }
    });

    const facultyList = formData.faculty || [];
    if (facultyList.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Faculty Information:', 20, doc.lastAutoTable.finalY + 10);
      const facultyHeaders = ['Abbr.', 'Name of Faculty', 'Abbr.', 'Name of Subject', 'Mentor Batch', 'Roll No.', 'Abbr.', 'Name of Lab', 'Lab Batch'];
      const facultyBody = [];

      facultyList.forEach((fac, index) => {
        const mentorInfo = mentorBatches.find(mb => mb.mentor === fac.abbr);
        const facultySubjects = formData.subjects.filter(s =>
          s.faculty && s.faculty.includes(fac.abbr)
        );

        const subjectName = facultySubjects.length > 0 ? facultySubjects[0].name : '';
        const subjectCode = facultySubjects.length > 0 ? facultySubjects[0].code : '';
        const labSubjects = facultySubjects.filter(s => s.type === 'Lab');
        const labName = labSubjects.length > 0 ? labSubjects[0].name : '';
        const labCode = labSubjects.length > 0 ? labSubjects[0].code : '';

        facultyBody.push([
          fac.abbr || '',
          fac.name || '',
          subjectCode || '',
          subjectName || '',
          mentorInfo ? `${mentorInfo.division}-${mentorInfo.batch}` : '',
          mentorInfo ? mentorInfo.roll_range?.join(' TO ') : '',
          labCode || '',
          labName || '',
          labSubjects.length > 0 ? batches.join(', ') : ''
        ]);
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [facultyHeaders],
        body: facultyBody,
        theme: 'grid',
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 7,
          halign: 'center',
          valign: 'middle',
          cellPadding: 2
        },
        styles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        }
      });
    }

    currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : currentY + 50;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('_____________________', 30, currentY);
    doc.text('Class Teacher', 30, currentY + 8);

    doc.text('_____________________', 120, currentY);
    doc.text('Department Academic Coordinator', 120, currentY + 8);

    doc.text('_____________________', 210, currentY);
    doc.text('Head of Department', 210, currentY + 8);

    currentY += 20;
    doc.setFontSize(8);
    doc.text(`Rev.: 00    Date: ${new Date().toLocaleDateString('en-GB')}`, 20, currentY);
    doc.text('Page 1 of 1', 250, currentY);

    doc.save(`${divisionName}_division_combined_timetable.pdf`);
  };

  const exportBatchToPDF = (batch) => {
    const doc = new jsPDF('l');
    if (logoFile) {
      doc.addImage(logoFile, 'PNG', 120, 5, 50, 20);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(formData.university || 'University Name', 148, 30, { align: 'center' });
    doc.text(formData.department || 'Department Name', 148, 40, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Batch: ${batch} - Academic Year: ${formData.academic_year || 'N/A'}`, 14, 50);

    const grid = findBatchGrid(batch);
    if (grid && Array.isArray(grid) && grid.length > 0) {
      autoTable(doc, {
        startY: 60,
        head: [['Day/Time', ...TIME_SLOTS]],
        body: grid.map((row, r) => [DAY_NAMES[r] || `Day ${r + 1}`, ...row.map(cell => cell || '')]),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
          cellPadding: 3,
          minCellHeight: 25
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
          cellPadding: 3
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [52, 152, 219], textColor: [255, 255, 255] }
        }
      });
    } else {
      doc.setFontSize(12);
      doc.text('No timetable data available for this batch.', 14, 60);
    }

    doc.save(`${batch}_timetable.pdf`);
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF('l');
      let currentY = 16;

      if (logoFile) {
        doc.addImage(logoFile, 'PNG', 120, 5, 50, 20);
        currentY = 35;
      }

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Complete Timetable', 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Academic Year: ${formData.academic_year || 'N/A'} | Department: ${formData.department || 'N/A'}`, 14, currentY + 8);
      currentY += 20;

      formData.divisions.forEach((division, divIndex) => {
        if (divIndex > 0) {
          doc.addPage('l');
          currentY = logoFile ? 35 : 16;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Division: ${division.name}`, 14, currentY);
        currentY += 10;

        division.batches.forEach((batch, batchIndex) => {
          const grid = findBatchGrid(batch);
          if (grid && Array.isArray(grid) && grid.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Batch: ${batch}`, 14, currentY);
            currentY += 10;

            autoTable(doc, {
              head: [['Day/Time', ...TIME_SLOTS]],
              body: grid.map((row, r) => [DAY_NAMES[r] || `Day ${r + 1}`, ...row.map(cell => cell || '')]),
              startY: currentY,
              theme: 'grid',
              headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 10
              },
              bodyStyles: {
                fontSize: 9,
                halign: 'center',
                valign: 'middle',
                cellPadding: 3,
                minCellHeight: 25
              },
              alternateRowStyles: { fillColor: [245, 245, 245] },
              styles: {
                lineColor: [0, 0, 0],
                lineWidth: 0.5,
                cellPadding: 3
              },
              columnStyles: {
                0: { fontStyle: 'bold', fillColor: [52, 152, 219], textColor: [255, 255, 255] }
              },
              didDrawPage: (data) => {
                currentY = data.cursor.y + 15;
              }
            });

            if (currentY > 150) {
              doc.addPage('l');
              currentY = 20;
            }
          }
        });
      });

      doc.save('complete_timetable.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Error generating PDF. Please try again.');
    }
  };

  const downloadExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      formData.divisions.forEach(division => {
        division.batches.forEach(batch => {
          const grid = findBatchGrid(batch);
          if (grid && Array.isArray(grid) && grid.length > 0) {
            const rows = grid.map((row, i) => {
              const day = DAY_NAMES[i] || `Day ${i + 1}`;
              const rowData = { 'Day': day };
              row.forEach((cell, idx) => {
                rowData[TIME_SLOTS[idx] || `Time ${idx + 1}`] = cell || '';
              });
              return rowData;
            });
            const ws = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, `${division.name}_${batch}`);
          }
        });
      });
      XLSX.writeFile(wb, 'complete_timetable.xlsx');
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('❌ Error generating Excel file. Please try again.');
    }
  };

  const exportDivisionToExcel = (divisionName) => {
    const wb = XLSX.utils.book_new();
    const division = formData.divisions.find(d => d.name === divisionName);
    const batches = division ? division.batches : [];
    batches.forEach(batch => {
      const grid = findBatchGrid(batch);
      if (grid && Array.isArray(grid) && grid.length > 0) {
        const rows = grid.map((row, i) => {
          const day = DAY_NAMES[i] || `Day ${i + 1}`;
          const rowData = { 'Day': day };
          row.forEach((cell, idx) => {
            rowData[TIME_SLOTS[idx] || `Time ${idx + 1}`] = cell || '';
          });
          return rowData;
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, batch);
      }
    });
    XLSX.writeFile(wb, `${divisionName}_timetable.xlsx`);
  };

  const previewFormData = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;
    const jsonPreview = JSON.stringify(formData, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `
      <html>
        <head>
          <title>Form Preview</title>
          <style>
            body { background-color: #0d0d0d; color: #eaeaea; padding: 20px; font-family: monospace; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <h2>🧾 Timetable Form Data Preview</h2>
          <pre>${jsonPreview}</pre>
        </body>
      </html>`;
    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  const handleParsedData = (parsed) => {
    if (!parsed || typeof parsed !== 'object') {
      alert('❌ Invalid parsed data.');
      return;
    }
    const safeParsed = {
      ...parsed,
      subjects: (parsed.subjects || []).map(s => ({
        ...initialSubject,
        ...s,
        faculty: Array.isArray(s.faculty) ? s.faculty : [s.faculty || ''],
        batches: Array.isArray(s.batches) ? s.batches : [],
      })),
      faculty: (parsed.faculty || []).map(f => ({
        ...initialFaculty,
        ...f,
        availability: Array.isArray(f.availability) ? f.availability : [0, 1, 2, 3, 4],
      })),
      rooms: (parsed.rooms || []).map(r => ({ ...initialRoom, ...r })),
      divisions: (parsed.divisions || []).map(d => ({
        name: d.name || '',
        batches: Array.isArray(d.batches) ? d.batches : ['']
      })),
      academic_year: parsed.academic_year || '',
      term: parsed.term || '',
      effective_from: parsed.effective_from || '',
      effective_to: parsed.effective_to || ''
    };
    setUndoStack(prev => [...prev, formData]);
    setFormData(prev => ({ ...prev, ...safeParsed }));

    if (parsed.mentor_batches && Array.isArray(parsed.mentor_batches)) {
      setMentorBatches(parsed.mentor_batches);
    }

    alert('✅ Data imported successfully!');
  };

  return (
    <div className={styles.container}>
      <h2>🧠 University Timetable Generator</h2>
      <div className={styles.section}>
        <div className={styles.utilityButtons}>
          <button onClick={previewFormData} className={styles.button} type="button">👁️ Preview Form</button>
          <button onClick={undoLastChange} className={styles.button} type="button" disabled={undoStack.length === 0}>↶ Undo</button>
          <button onClick={resetForm} className={styles.button} type="button">🔄 Reset Form</button>
        </div>
      </div>
      <div className={styles.section}>
        <label>📤 Upload Logo:
          <input type="file" accept="image/*" onChange={handleLogoChange} />
        </label>
      </div>
      <div className={styles.section}>
        {/* <FileUpload onParsed={handleParsedData} /> */}
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🏫 Institution Information</h2>
        <div className={styles.grid}>
          <input
            className={styles.input}
            type="text"
            placeholder="University Name"
            value={formData.university}
            onChange={e => handleChange('university', e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Department Name"
            value={formData.department}
            onChange={e => handleChange('department', e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Academic Year (e.g., 2025-26)"
            value={formData.academic_year}
            onChange={e => handleChange('academic_year', e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Term"
            value={formData.term}
            onChange={e => handleChange('term', e.target.value)}
          />
          <input
            className={styles.input}
            type="date"
            placeholder="Effective From"
            value={formData.effective_from}
            onChange={e => handleChange('effective_from', e.target.value)}
          />
          <input
            className={styles.input}
            type="date"
            placeholder="Effective To"
            value={formData.effective_to}
            onChange={e => handleChange('effective_to', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🏫 Divisions & Batches</h3>
        {formData.divisions.map((division, divIndex) => (
          <div key={divIndex} className={styles.card}>
            <input
              className={styles.input}
              placeholder="Division Name (e.g., A, B, C)"
              value={division.name}
              onChange={e => handleDivisionChange(divIndex, e.target.value)}
            />
            <div>
              <strong>Batches:</strong>
              {division.batches.map((batch, batchIndex) => (
                <input
                  key={batchIndex}
                  className={styles.input}
                  placeholder={`Batch ${batchIndex + 1}`}
                  value={batch}
                  onChange={e => handleBatchChange(divIndex, batchIndex, e.target.value)}
                />
              ))}
              <button className={styles.addButton} type="button" onClick={() => addBatchToDivision(divIndex)}>
                ➕ Add Batch
              </button>
            </div>
          </div>
        ))}
        <button className={styles.button} type="button" onClick={addDivision}>➕ Add Division</button>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>👩‍🏫 Faculty Management</h3>
        {formData.faculty.map((faculty, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.grid}>
              <input
                className={styles.input}
                placeholder="Faculty Abbreviation"
                value={faculty.abbr}
                onChange={e => handleFacultyChange(index, 'abbr', e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Full Name"
                value={faculty.name}
                onChange={e => handleFacultyChange(index, 'name', e.target.value)}
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Max per day"
                value={faculty.max_per_day}
                onChange={e => handleFacultyChange(index, 'max_per_day', parseInt(e.target.value) || 0)}
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Max per week"
                value={faculty.max_per_week}
                onChange={e => handleFacultyChange(index, 'max_per_week', parseInt(e.target.value) || 0)}
              />
              <input
                className={styles.input}
                placeholder="Availability (0-4, comma separated)"
                value={faculty.availability.join(',')}
                onChange={e => handleFacultyChange(index, 'availability', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button className={styles.button} type="button" onClick={addFaculty}>➕ Add Faculty</button>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📘 Subject Configuration</h3>
        {formData.subjects.map((subject, index) => (
          <div key={index} className={styles.subjectCard}>
            <div className={styles.grid}>
              <input
                className={styles.input}
                placeholder="Subject Code"
                value={subject.code}
                onChange={e => handleSubjectChange(index, 'code', e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Subject Name"
                value={subject.name}
                onChange={e => handleSubjectChange(index, 'name', e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Faculty (semicolon separated)"
                value={(subject.faculty || []).join(';')}
                onChange={e => handleSubjectChange(index, 'faculty', e.target.value.split(';'))}
              />
              <select
                className={styles.select}
                value={subject.type}
                onChange={e => handleSubjectChange(index, 'type', e.target.value)}
              >
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
              </select>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={subject.is_mentor || false}
                  onChange={e => handleSubjectChange(index, 'is_mentor', e.target.checked)}
                />
                Mentor Subject
              </label>
              <select
                className={styles.select}
                value={subject.room_type}
                onChange={e => handleSubjectChange(index, 'room_type', e.target.value)}
              >
                <option value="Theory">Theory Room</option>
                <option value="Lab">Lab Room</option>
              </select>
              <input
                className={styles.input}
                type="number"
                placeholder="Duration (minutes)"
                value={subject.duration}
                onChange={e => handleSubjectChange(index, 'duration', parseInt(e.target.value) || 50)}
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Min per week"
                value={subject.min_per_week}
                onChange={e => handleSubjectChange(index, 'min_per_week', parseInt(e.target.value) || 1)}
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Max per week"
                value={subject.max_per_week}
                onChange={e => handleSubjectChange(index, 'max_per_week', parseInt(e.target.value) || 5)}
              />
              <input
                className={styles.input}
                placeholder="Required Room (optional)"
                value={subject.required_room}
                onChange={e => handleSubjectChange(index, 'required_room', e.target.value)}
              />
            </div>
            {subject.type === 'Lab' && (
              <div className={styles.batchSection}>
                <h4>Lab Batches</h4>
                {(subject.batches || []).map((batch, batchIndex) => (
                  <div key={batchIndex} className={styles.grid}>
                    <input
                      className={styles.input}
                      placeholder="Batch Name"
                      value={batch.name || ''}
                      onChange={e => handleLabBatchChange(index, batchIndex, 'name', e.target.value)}
                    />
                    <input
                      className={styles.input}
                      placeholder="Faculty for this batch"
                      value={batch.faculty || ''}
                      onChange={e => handleLabBatchChange(index, batchIndex, 'faculty', e.target.value)}
                    />
                    <input
                      className={styles.input}
                      placeholder="Room for this batch"
                      value={batch.room || ''}
                      onChange={e => handleLabBatchChange(index, batchIndex, 'room', e.target.value)}
                    />
                  </div>
                ))}
                <button className={styles.addButton} type="button" onClick={() => addBatchToSubject(index)}>
                  ➕ Add Lab Batch
                </button>
              </div>
            )}
          </div>
        ))}
        <button className={styles.button} type="button" onClick={addSubject}>➕ Add Subject</button>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🏢 Room Management</h3>
        {formData.rooms.map((room, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.grid}>
              <input
                className={styles.input}
                placeholder="Room Name/Number"
                value={room.name}
                onChange={e => handleRoomChange(index, 'name', e.target.value)}
              />
              <select
                className={styles.select}
                value={room.type}
                onChange={e => handleRoomChange(index, 'type', e.target.value)}
              >
                <option value="Theory">Theory Room</option>
                <option value="Lab">Lab Room</option>
              </select>
              <input
                className={styles.input}
                type="number"
                placeholder="Capacity"
                value={room.capacity}
                onChange={e => handleRoomChange(index, 'capacity', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button className={styles.button} type="button" onClick={addRoom}>➕ Add Room</button>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🧑‍🏫 Mentor Batches</h3>
        {mentorBatches.map((batch, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.grid}>
              <input
                className={styles.input}
                placeholder="Division"
                value={batch.division}
                onChange={e => handleMentorBatchChange(index, 'division', e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Batch"
                value={batch.batch}
                onChange={e => handleMentorBatchChange(index, 'batch', e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Mentor"
                value={batch.mentor}
                onChange={e => handleMentorBatchChange(index, 'mentor', e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Roll From"
                value={batch.roll_range?.[0] || ''}
                onChange={e => handleMentorBatchChange(index, 'roll_range', { index: 0, val: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="Roll To"
                value={batch.roll_range?.[1] || ''}
                onChange={e => handleMentorBatchChange(index, 'roll_range', { index: 1, val: e.target.value })}
              />
              <button className={styles.button} type="button" onClick={() => removeMentorBatch(index)}>
                ❌ Remove
              </button>
            </div>
          </div>
        ))}
        <button className={styles.button} type="button" onClick={addMentorBatch}>➕ Add Mentor Batch</button>
      </div>
      <div className={styles.section}>
        <button
          className={styles.button}
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <span className={styles.spinner}>⏳ Generating...</span>
          ) : (
            "🚀 Generate Timetable"
          )}
        </button>
      </div>
      {generatedTimetable && (
        <div className={styles.section}>
          <h3>✅ Generated Timetables</h3>
          <div className={styles.section}>
            <h4>📄 Complete Timetable Downloads</h4>
            <button className={styles.downloadButton} onClick={downloadPDF} type="button">
              📄 Download Complete PDF
            </button>
            <button className={styles.downloadButton} onClick={downloadExcel} type="button">
              📊 Download Complete Excel
            </button>
          </div>
          {formData.divisions.map((div, i) => (
            <div className={styles.divisionBlock} key={i}>
              <h4>📚 {div.name} Division</h4>
              <button className={styles.downloadButton} onClick={() => exportDivisionToPDF(div.name)}>
                📄 Export Combined Division PDF
              </button>
              <button className={styles.downloadButton} onClick={() => exportDivisionToExcel(div.name)}>
                📊 Export Division Excel
              </button>
              {div.batches.map((batch, j) => (
                <div className={styles.batchBlock} key={j}>
                  <p>📘 Batch: {batch}</p>
                  <button className={styles.downloadButton} onClick={() => exportBatchToPDF(batch)}>
                    📄 Export Individual Batch PDF
                  </button>
                </div>
              ))}
            </div>
          ))}
          <h4>🧑‍🏫 Mentor Batches Summary</h4>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Division</th>
                <th>Mentor</th>
                <th>Roll Range</th>
              </tr>
            </thead>
            <tbody>
              {mentorBatches.map((mb, i) => (
                <tr key={i}>
                  <td>{mb.batch}</td>
                  <td>{mb.division}</td>
                  <td>{mb.mentor}</td>
                  <td>{mb.roll_range?.join(' - ') || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.section}>
            <h4>📅 Timetable Preview</h4>
            {Object.keys(generatedTimetable).map(division => (
              <div key={division} style={{ marginBottom: '30px' }}>
                <h5 style={{
                  color: '#4a90e2',
                  margin: '20px 0 15px 0',
                  fontSize: '18px',
                  borderBottom: '2px solid #4a90e2',
                  paddingBottom: '5px'
                }}>{division} Division</h5>
                {Object.keys(generatedTimetable[division].batches || {}).map(batch => {
                  const batchData = generatedTimetable[division].batches[batch];
                  if (!batchData || typeof batchData !== 'object') return null;

                  return (
                    <div key={batch} style={{ marginBottom: '25px' }}>
                      <h6 style={{
                        color: '#66cc99',
                        margin: '15px 0 10px 0',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>📘 Batch: {batch}</h6>
                      <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Day/Time</th>
                              {TIME_SLOTS.map((timeSlot, i) => (
                                <th key={i}>{timeSlot}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {DAY_NAMES.map((dayName, r) => {
                              const daySlots = batchData[dayName] || [];

                              return (
                                <tr key={r}>
                                  <td>{dayName}</td>
                                  {TIME_SLOTS.map((timeSlot, c) => {
                                    const cellContent = daySlots[c] || '-';
                                    const isLunchBreak = timeSlot === '01:00-01:40';
                                    const isEmpty = cellContent === '-' || cellContent === '';

                                    return (
                                      <td key={c} className={
                                        isLunchBreak ? styles.lunchBreak :
                                        isEmpty ? styles.emptyCell : ''
                                      }>
                                        <div>
                                          {cellContent === 'LUNCH BREAK' ? '🍽️ LUNCH\nBREAK' : cellContent}
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
