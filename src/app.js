const express = require('express');

// Initialize the Express application.
const app = express();

// Bound JSON payloads and return consistent JSON errors for parser failures.
app.use(express.json({ limit: '100kb' }));

// In-memory data store for courses (seeded with sample courses).
const courses = [
  { id: 1, title: 'Introduction to DevOps', instructor: 'Dr. Jane Doe' },
  { id: 2, title: 'Agile Methodologies', instructor: 'Prof. John Smith' }
];

// In-memory data store for student enrollments.
const enrollments = [];

// GET /courses - Retrieve the list of all available courses.
app.get('/courses', (req, res) => {
  res.status(200).json(courses);
});

// POST /enroll - Enroll a student into a specified course.
app.post('/enroll', (req, res) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  const { studentId: rawStudentId, courseId: rawCourseId } = body;

  if (typeof rawStudentId !== 'string') {
    return res.status(400).json({ error: 'studentId must be a non-empty string' });
  }

  const studentId = rawStudentId.trim();
  if (studentId.length === 0 || studentId.length > 100) {
    return res.status(400).json({ error: 'studentId must contain between 1 and 100 characters' });
  }

  // Accept positive integer IDs as numbers or digit-only strings.
  const courseIdText = typeof rawCourseId === 'string' ? rawCourseId.trim() : null;
  const courseId = typeof rawCourseId === 'number'
    ? rawCourseId
    : courseIdText !== null && /^\d+$/.test(courseIdText)
      ? Number(courseIdText)
      : NaN;

  if (!Number.isSafeInteger(courseId) || courseId <= 0) {
    return res.status(400).json({ error: 'courseId must be a positive safe integer' });
  }

  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const enrollment = {
    enrollmentId: enrollments.length + 1,
    studentId,
    course: course.title
  };

  enrollments.push(enrollment);

  return res.status(201).json(enrollment);
});

// GET /enrollments - Retrieve all enrollment records.
app.get('/enrollments', (req, res) => {
  res.status(200).json(enrollments);
});

// Normalize malformed or oversized JSON request errors.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }

  return next(err);
});

// Export app without listening to port for testing purposes.
module.exports = app;
