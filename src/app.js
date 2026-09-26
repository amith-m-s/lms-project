const express = require('express');

// Initialize the Express application
const app = express();

// Middleware to parse incoming JSON payloads
app.use(express.json());

// In-memory data store for courses (seeded with sample courses)
const courses = [
  { id: 1, title: 'Introduction to DevOps', instructor: 'Dr. Jane Doe' },
  { id: 2, title: 'Agile Methodologies', instructor: 'Prof. John Smith' }
];

// In-memory data store for student enrollments
const enrollments = [];

// GET /courses - Retrieve the list of all available courses
app.get('/courses', (req, res) => {
  res.status(200).json(courses);
});

// POST /enroll - Enroll a student into a specified course
app.post('/enroll', (req, res) => {
  const { studentId, courseId } = req.body;

  // Find course matching the provided courseId (supporting number or numeric string)
  const course = courses.find((c) => c.id === Number(courseId));

  // If course does not exist, return a 404 error
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Create enrollment record
  const enrollment = {
    enrollmentId: enrollments.length + 1,
    studentId,
    course: course.title
  };

  // Save to in-memory store
  enrollments.push(enrollment);

  // Return the created enrollment record with status 201 Created
  return res.status(201).json(enrollment);
});

// GET /enrollments - Retrieve all enrollment records
app.get('/enrollments', (req, res) => {
  res.status(200).json(enrollments);
});

// Export app without listening to port for testing purposes
module.exports = app;
