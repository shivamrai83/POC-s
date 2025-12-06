const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

function createApp(db) {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Todo API is running' });
  });

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
            res.status(500).json({ error: err.message });
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
            res.status(500).json({ error: err.message });
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

  return app;
}

module.exports = { createApp };

