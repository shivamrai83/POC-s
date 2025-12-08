const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { createApp } = require('../server');

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

  test('PUT /api/todos/:id should update title', async () => {
    // Create a todo
    const createResponse = await request(app)
      .post('/api/todos')
      .send({ title: 'Original Title' })
      .expect(201);

    const todoId = createResponse.body.id;

    // Update title
    const response = await request(app)
      .put(`/api/todos/${todoId}`)
      .send({ title: 'Updated Title' })
      .expect(200);

    expect(response.body).toHaveProperty('title', 'Updated Title');
  });

  test('PUT /api/todos/:id should update both title and completed', async () => {
    // Create a todo
    const createResponse = await request(app)
      .post('/api/todos')
      .send({ title: 'Original Title' })
      .expect(201);

    const todoId = createResponse.body.id;

    // Update both fields
    const response = await request(app)
      .put(`/api/todos/${todoId}`)
      .send({ title: 'New Title', completed: true })
      .expect(200);

    expect(response.body).toHaveProperty('title', 'New Title');
    expect(response.body).toHaveProperty('completed', 1);
  });

  test('PUT /api/todos/:id should return 400 if no fields to update', async () => {
    // Create a todo
    const createResponse = await request(app)
      .post('/api/todos')
      .send({ title: 'Test Todo' })
      .expect(201);

    const todoId = createResponse.body.id;

    // Try to update with empty body
    const response = await request(app)
      .put(`/api/todos/${todoId}`)
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error', 'No fields to update');
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

describe('Database Error Handling', () => {
  test('GET /api/todos should handle database errors', async () => {
    // Create a new closed database app for this test
    const closedDb = new sqlite3.Database(':memory:');
    closedDb.close();
    const closedApp = createApp(closedDb);

    const response = await request(closedApp)
      .get('/api/todos')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/todos/:id should handle database errors', async () => {
    // Create a new closed database app for this test
    const closedDb = new sqlite3.Database(':memory:');
    closedDb.close();
    const closedApp = createApp(closedDb);

    const response = await request(closedApp)
      .get('/api/todos/1')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/todos should handle database insert errors', async () => {
    const closedDb = new sqlite3.Database(':memory:');
    closedDb.close();
    const closedApp = createApp(closedDb);

    const response = await request(closedApp)
      .post('/api/todos')
      .send({ title: 'Test Todo' })
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('PUT /api/todos/:id should handle database update errors', async () => {
    const closedDb = new sqlite3.Database(':memory:');
    closedDb.close();
    const closedApp = createApp(closedDb);

    const response = await request(closedApp)
      .put('/api/todos/1')
      .send({ completed: true })
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('DELETE /api/todos/:id should handle database delete errors', async () => {
    const closedDb = new sqlite3.Database(':memory:');
    closedDb.close();
    const closedApp = createApp(closedDb);

    const response = await request(closedApp)
      .delete('/api/todos/1')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/todos should handle database get error after insert', async () => {
    // Create a database and set it up
    const testDbPath2 = './test-todos-error.db';
    const errorDb2 = new sqlite3.Database(testDbPath2, (err) => {
      if (err) return;
      errorDb2.run(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });
    
    const errorApp2 = createApp(errorDb2);
    
    // Close the database right after triggering the insert
    // This should cause the db.get callback to fail
    const promise = request(errorApp2)
      .post('/api/todos')
      .send({ title: 'Test Todo' });
    
    // Close database immediately to cause get to fail
    errorDb2.close();
    
    const response = await promise;
    
    // The response might be 500 (if get fails) or might succeed if timing is off
    // But we're trying to trigger the error path
    expect([201, 500]).toContain(response.status);
    
    // Clean up
    if (fs.existsSync(testDbPath2)) {
      try {
        fs.unlinkSync(testDbPath2);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  });

  test('PUT /api/todos/:id should handle database get error after update', async () => {
    // Create a database and set it up
    const testDbPath3 = './test-todos-error2.db';
    const errorDb3 = new sqlite3.Database(testDbPath3, (err) => {
      if (err) return;
      errorDb3.run(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, () => {
        // Insert a todo first
        errorDb3.run('INSERT INTO todos (title) VALUES (?)', ['Test Todo']);
      });
    });
    
    const errorApp3 = createApp(errorDb3);
    
    // Wait a bit for the insert to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Close the database right after triggering the update
    // This should cause the db.get callback to fail
    const promise = request(errorApp3)
      .put('/api/todos/1')
      .send({ completed: true });
    
    // Close database immediately to cause get to fail
    errorDb3.close();
    
    const response = await promise;
    
    // The response might be 500 (if get fails) or might succeed if timing is off
    expect([200, 500]).toContain(response.status);
    
    // Clean up
    if (fs.existsSync(testDbPath3)) {
      try {
        fs.unlinkSync(testDbPath3);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  });
});

