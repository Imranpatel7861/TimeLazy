from flask import Blueprint, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PyPDF2 import PdfReader

student_bp = Blueprint('student_bp', __name__)
CORS(student_bp)

def init_db():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll_no TEXT NOT NULL,
            prn TEXT NOT NULL,
            year TEXT NOT NULL,
            division TEXT NOT NULL,
            file_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Add admin_id column if it doesn't exist
    c.execute('''
        PRAGMA table_info(students)
    ''')
    columns = [column[1] for column in c.fetchall()]
    if 'admin_id' not in columns:
        c.execute('''
            ALTER TABLE students ADD COLUMN admin_id INTEGER
        ''')
    conn.commit()
    conn.close()

init_db()

def extract_text_from_pdf(pdf_file):
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def parse_student_data(text):
    students = []
    lines = text.split('\n')
    # Skip the first 4 lines (title + headers)
    for i in range(4, len(lines) - 2, 3):  # Start from line 4, step by 3
        name = lines[i].strip()
        roll_no = lines[i + 1].strip()
        prn = lines[i + 2].strip()
        if name and roll_no and prn:  # Ensure no empty values
            students.append({'name': name, 'roll_no': roll_no, 'prn': prn})
    return students

@student_bp.route('/api/admin/students/bulk', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    year = request.form.get('year')
    division = request.form.get('division')
    admin_id = request.form.get('admin_id', default=1)

    if not file or not year or not division:
        return jsonify({'error': 'Missing data'}), 400

    try:
        text = extract_text_from_pdf(file)
        print("Extracted Text:", text)  # Debug
        students = parse_student_data(text)
        print("Parsed Students:", students)  # Debug

        if not students:
            return jsonify({'error': 'No student data found in PDF'}), 400

        conn = sqlite3.connect('students.db')
        c = conn.cursor()
        for student in students:
            c.execute('''
                INSERT INTO students (name, roll_no, prn, year, division, admin_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (student['name'], student['roll_no'], student['prn'], year, division, admin_id))
        conn.commit()
        conn.close()

        return jsonify({'message': f'Successfully uploaded {len(students)} students'}), 201
    except Exception as e:
        print("Error:", str(e))  # Debug
        return jsonify({'error': str(e)}), 500

@student_bp.route('/api/admin/students/pdf/<year>/<division>', methods=['GET'])
def generate_pdf(year, division):
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('''
        SELECT name, roll_no, prn FROM students
        WHERE year = ? AND division = ?
    ''', (year, division))
    students = c.fetchall()
    conn.close()

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.drawString(100, 750, f"{year} - {division} Students")

    y = 700
    for idx, student in enumerate(students, start=1):
        p.drawString(100, y, f"{idx}. Name: {student[0]}")
        p.drawString(100, y - 20, f"   Roll No: {student[1]}")
        p.drawString(100, y - 40, f"   PRN: {student[2]}")
        y -= 60

    p.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"{year}_{division}_students.pdf", mimetype='application/pdf')

@student_bp.route('/api/admin/students', methods=['GET'])
def get_students():
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('SELECT id, name, roll_no, prn, year, division, file_name, created_at, admin_id FROM students')
    students = c.fetchall()
    conn.close()

    result = []
    for student in students:
        result.append({
            'id': student[0],
            'name': student[1],
            'rollNo': student[2],
            'prn': student[3],
            'year': student[4],
            'division': student[5],
            'fileName': student[6],
            'createdAt': student[7],
            'adminId': student[8]
        })
    return jsonify(result)

@student_bp.route('/api/admin/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    conn = sqlite3.connect('students.db')
    c = conn.cursor()
    c.execute('DELETE FROM students WHERE id = ?', (student_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student deleted'}), 200
