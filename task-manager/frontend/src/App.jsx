import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Check, X, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [isAdding, setIsAdding] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      if (response.data.success) {
        setTasks(response.data.data);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tasks. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsAdding(true);
      const response = await axios.post(API_URL, { title: newTaskTitle });
      if (response.data.success) {
        setTasks([response.data.data, ...tasks]);
        setNewTaskTitle('');
      }
      setIsAdding(false);
    } catch (err) {
      setError('Failed to add task.');
      setIsAdding(false);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const response = await axios.patch(`${API_URL}/${task.id}`, {
        completed: !task.completed
      });
      if (response.data.success) {
        setTasks(tasks.map(t => t.id === task.id ? response.data.data : t));
      }
    } catch (err) {
      setError('Failed to update task.');
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      if (response.data.success) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="app-container"
    >
      <header>
        <h1>Task Master</h1>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            className="task-input"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={isAdding}
          />
          <button type="submit" className="add-btn" disabled={isAdding || !newTaskTitle.trim()}>
            {isAdding ? <Loader2 className="spinner-small animate-spin" size={20} /> : <Plus size={20} />}
            Add
          </button>
        </form>

        <div className="filter-bar">
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your tasks...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <AlertCircle size={48} className="error-msg" />
            <p className="error-msg">{error}</p>
            <button className="filter-btn" onClick={fetchTasks}>Retry</button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-container">
            <ClipboardList size={48} strokeWidth={1} />
            <p>No tasks found. Time to add some!</p>
          </div>
        ) : (
          <div className="task-list">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="task-item"
                >
                  <div className="task-content">
                    <div
                      className={`checkbox ${task.completed ? 'completed' : ''}`}
                      onClick={() => toggleComplete(task)}
                    >
                      {task.completed && <Check size={14} color="white" />}
                    </div>
                    <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="task-actions">
                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} in total • {tasks.filter(t => t.completed).length} completed
      </footer>
    </motion.div>
  );
}

export default App;
