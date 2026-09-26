const request = require('supertest');
const app = require('../src/app');

describe('LMS API Endpoints', () => {
  // Test 1: Verify GET /courses returns 200 and a non-empty array of courses
  test('GET /courses returns 200 and a non-empty array', async () => {
    const response = await request(app).get('/courses');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test 2: Verify POST /enroll with a valid courseId returns 201 and the course name
  test('POST /enroll with a valid courseId returns 201 and the correct course name in the response', async () => {
    const payload = { studentId: 'STU101', courseId: 1 };
    const response = await request(app).post('/enroll').send(payload);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('course', 'Introduction to DevOps');
    expect(response.body).toHaveProperty('studentId', 'STU101');
    expect(response.body).toHaveProperty('enrollmentId');
  });

  // Test 3: Verify POST /enroll with an invalid courseId returns 404
  test('POST /enroll with an invalid courseId returns 404', async () => {
    const payload = { studentId: 'STU101', courseId: 999 };
    const response = await request(app).post('/enroll').send(payload);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'Course not found');
  });
});
