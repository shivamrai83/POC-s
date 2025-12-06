const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { createApp } = require('./helpers/test-server');

// Create a test database
const testDbPath = './test-todos.db';
let db;
let app;

beforeAll((done) => {
  // Setup test database
  db = new sqlite3.Database(testDbPath, (err) => {
    if (err) {
      console.error('Error opening test database:', err);
      done(err);
      return;
    }
    
    db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        done(err);
        return;
      }
      // Create app with test database
      app = createApp(db);
      done();
    });
  });
});

afterAll((done) => {
  // Close database connection
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      }
      // Clean up test database file
      if (fs.existsSync(testDbPath)) {
        try {
          fs.unlinkSync(testDbPath);
        } catch (err) {
          console.error('Error deleting test database:', err);
        }
      }
      done();
    });
  } else {
    done();
  }
});

beforeEach((done) => {
  // Clear todos table before each test
  if (db) {
    db.run('DELETE FROM todos', (err) => {
      done();
    });
  } else {
    done();
  }
});

describe('Health Check Endpoint', () => {
  test('GET /api/health should return 200 and status OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'Todo API is running');
  });
});

describe('Todos API', () => {
  test('GET /api/todos should return empty array initially', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  test('POST /api/todos should create a new todo', async () => {
    const newTodo = { title: 'Test Todo' };
    
    const response = await request(app)
      .post('/api/todos')
      .send(newTodo)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title', 'Test Todo');
    expect(response.body).toHaveProperty('completed', 0);
  });

  test('POST /api/todos should return 400 if title is missing', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/todos should return 400 if title is empty', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: '' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/todos/:id should return a specific todo', async () => {
    // First create a todo
    const createResponse = await request(app)
      .post('/api/todos')
      .send({ title: 'Get Me Todo' })
      .expect(201);

    const todoId = createResponse.body.id;

    // Then get it
    const response = await request(app)
      .get(`/api/todos/${todoId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', todoId);
    expect(response.body).toHaveProperty('title', 'Get Me Todo');
  });

  test('GET /api/todos/:id should return 404 for non-existent todo', async () => {
    const response = await request(app)
      .get('/api/todos/99999')
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  test('PUT /api/todos/:id should update a todo', async () => {
    // Create a todo
    const createResponse = await request(app)
      .post('/api/todos')
      .send({ title: 'Update Me' })
      .expect(201);

    const todoId = createResponse.body.id;

    // Update it
    const response = await request(app)
      .put(`/api/todos/${todoId}`)
      .send({ completed: true })
      .expect(200);

    expect(response.body).toHaveProperty('completed', 1);
    expect(response.body).toHaveProperty('title', 'Update Me');
  });

  test('PUT /api/todos/:id should return 404 for non-existent todo', async () => {
    const response = await request(app)
      .put('/api/todos/99999')
      .send({ completed: true })
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  test('DELETE /api/todos/:id should delete a todo', async () => {
    // Create a todo
    const createResponse = await request(app)
      .post('/api/todos')
      .send({ title: 'Delete Me' })
      .expect(201);

    const todoId = createResponse.body.id;

    // Delete it
    const response = await request(app)
      .delete(`/api/todos/${todoId}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Todo deleted successfully');

    // Verify it's deleted
    await request(app)
      .get(`/api/todos/${todoId}`)
      .expect(404);
  });

  test('DELETE /api/todos/:id should return 404 for non-existent todo', async () => {
    const response = await request(app)
      .delete('/api/todos/99999')
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});

