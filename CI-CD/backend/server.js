const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function createApp(db) {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

// Routes

// Get all todos
app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a single todo
app.get('/api/todos/:id', (req, res) => {
  db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    res.json(row);
  });
});

// Create a new todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  
  if (!title || title.trim() === '') {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  db.run(
    'INSERT INTO todos (title) VALUES (?)',
    [title],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          /* istanbul ignore next */
          res.status(500).json({ error: err.message });
          /* istanbul ignore next */
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Update a todo
app.put('/api/todos/:id', (req, res) => {
  const { title, completed } = req.body;
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (completed !== undefined) {
    updates.push('completed = ?');
    values.push(completed ? 1 : 0);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  values.push(req.params.id);

  db.run(
    `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
      db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          /* istanbul ignore next */
          res.status(500).json({ error: err.message });
          /* istanbul ignore next */
          return;
        }
        res.json(row);
      });
    }
  );
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    res.json({ message: 'Todo deleted successfully' });
  });
});

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Todo API is running' });
  });

  return app;
}

// Database setup and server startup (only when not in test mode)
/* istanbul ignore next */
if (require.main === module) {
  /* istanbul ignore next */
  const PORT = process.env.PORT || 5000;
  /* istanbul ignore next */
  const dbPath = process.env.TEST_DB_PATH || './todos.db';
  
  /* istanbul ignore next */
  const db = new sqlite3.Database(dbPath, (err) => {
    /* istanbul ignore next */
    if (err) {
      /* istanbul ignore next */
      console.error('Error opening database:', err);
    } else {
      /* istanbul ignore next */
      console.log('Connected to SQLite database');
      /* istanbul ignore next */
      db.run(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
  });

  /* istanbul ignore next */
  const app = createApp(db);
  
  /* istanbul ignore next */
  app.listen(PORT, () => {
    /* istanbul ignore next */
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = { createApp };

