const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store
let tasks = [
  {
    id: uuidv4(),
    title: 'Complete assignment',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Review code',
    completed: true,
    createdAt: new Date().toISOString(),
  }
];

// Helper for error responses
const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};

// GET /tasks - Return all tasks
app.get('/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Basic Validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return sendError(res, 400, 'Title is required and must be a non-empty string.');
  }

  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask); // Add to beginning
  res.status(201).json({ success: true, data: newTask });
});

// PATCH /tasks/:id - Update a task status
app.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return sendError(res, 404, 'Task not found.');
  }

  // Update logic - can also update title if needed (bonus)
  if (typeof completed === 'boolean') {
    tasks[taskIndex].completed = completed;
  }
  
  if (req.body.title && typeof req.body.title === 'string' && req.body.title.trim() !== '') {
    tasks[taskIndex].title = req.body.title.trim();
  }

  res.json({ success: true, data: tasks[taskIndex] });
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return sendError(res, 404, 'Task not found.');
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ success: true, data: deletedTask });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
