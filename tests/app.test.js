const request = require('supertest');
const app = require('../src/app');

describe('LMS API Endpoints', () => {
  test('GET /courses returns 200 and a non-empty array', async () => {
    const response = await request(app).get('/courses');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('POST /enroll accepts a valid numeric course ID', async () => {
    const response = await request(app)
      .post('/enroll')
      .send({ studentId: 'STU101', courseId: 1 });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      course: 'Introduction to DevOps',
      studentId: 'STU101'
    });
    expect(response.body).toHaveProperty('enrollmentId');
  });

  test('POST /enroll accepts a digit-only course ID string and trims the student ID', async () => {
    const response = await request(app)
      .post('/enroll')
      .send({ studentId: ' STU102 ', courseId: ' 2 ' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      course: 'Agile Methodologies',
      studentId: 'STU102'
    });
  });

  test('POST /enroll returns 404 for a well-formed but unknown course ID', async () => {
    const before = (await request(app).get('/enrollments')).body.length;
    const response = await request(app)
      .post('/enroll')
      .send({ studentId: 'STU103', courseId: 999 });
    const after = (await request(app).get('/enrollments')).body.length;

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'Course not found');
    expect(after).toBe(before);
  });

  test('POST /enroll rejects a missing request body', async () => {
    const response = await request(app).post('/enroll');

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Request body must be a non-empty JSON object');
  });

  test('POST /enroll rejects an empty request object', async () => {
    const response = await request(app).post('/enroll').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Request body must be a non-empty JSON object');
  });

  test('POST /enroll rejects array request bodies', async () => {
    const response = await request(app)
      .post('/enroll')
      .send([{ studentId: 'STU104', courseId: 1 }]);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Request body must be a non-empty JSON object');
  });

  test.each([
    ['missing', undefined],
    ['null', null],
    ['number', 123],
    ['object', { id: 'STU105' }],
    ['blank', '   '],
    ['too long', 'S'.repeat(101)]
  ])('POST /enroll rejects a %s studentId', async (_description, studentId) => {
    const payload = { courseId: 1 };
    if (studentId !== undefined) {
      payload.studentId = studentId;
    }

    const response = await request(app).post('/enroll').send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/studentId/);
  });

  test.each([
    ['missing', undefined],
    ['null', null],
    ['zero', 0],
    ['negative', -1],
    ['fractional', 1.5],
    ['decimal string', '1.5'],
    ['exponent string', '1e0'],
    ['hexadecimal string', '0x1'],
    ['boolean', true],
    ['object', { id: 1 }],
    ['empty string', '']
  ])('POST /enroll rejects a %s courseId', async (_description, courseId) => {
    const payload = { studentId: 'STU106' };
    if (courseId !== undefined) {
      payload.courseId = courseId;
    }

    const response = await request(app).post('/enroll').send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'courseId must be a positive safe integer');
  });

  test('POST /enroll returns a JSON error for malformed JSON', async () => {
    const response = await request(app)
      .post('/enroll')
      .set('Content-Type', 'application/json')
      .send('{"studentId":');

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid JSON body');
  });
});
