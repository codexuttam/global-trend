const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store with more detailed initial tasks
let tasks = [
  {
    id: uuidv4(),
    title: 'Complete assignment',
    description: 'Finish the technical task for the interview',
    completed: false,
    priority: 'high',
    category: 'work',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Review code',
    description: 'Check the latest PR on GitHub',
    completed: true,
    priority: 'medium',
    category: 'development',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  }
];

// Helper for error responses
const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /tasks - Return all tasks
app.get('/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

// GET /tasks/:id - Return a single task
app.get('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return sendError(res, 404, 'Task not found.');
  }
  res.json({ success: true, data: task });
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title, description, priority, category } = req.body;

  // Basic Validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return sendError(res, 400, 'Title is required.');
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return sendError(res, 400, 'Priority must be one of: low, medium, high.');
  }

  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: false,
    priority: priority || 'medium',
    category: category || 'general',
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  res.status(201).json({ success: true, data: newTask });
});

// PATCH /tasks/:id - Update a task
app.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title, description, priority, category } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return sendError(res, 404, 'Task not found.');
  }

  // Update logic
  if (typeof completed === 'boolean') tasks[taskIndex].completed = completed;
  if (title) tasks[taskIndex].title = title.trim();
  if (description !== undefined) tasks[taskIndex].description = description.trim();
  if (priority) tasks[taskIndex].priority = priority;
  if (category) tasks[taskIndex].category = category;

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

// DELETE /tasks - Delete all tasks
app.delete('/tasks', (req, res) => {
  tasks.length = 0; // Clear the array
  res.json({ success: true, message: 'All tasks deleted' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
