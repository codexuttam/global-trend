import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Plus, Trash2, Check, ClipboardList, Loader2, AlertCircle,
  Search, Calendar, Tag, ChevronDown, ChevronUp,
  BarChart2, Target, Clock, Zap, Layout
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const API_URL = 'http://localhost:5000/tasks';

const PRIORITIES = {
  high: { label: 'High', color: '#ef4444', icon: Zap },
  medium: { label: 'Medium', color: '#f59e0b', icon: Clock },
  low: { label: 'Low', color: '#10b981', icon: Target }
};

const CATEGORIES = ['All', 'Work', 'Personal', 'Development', 'Urgent', 'Health'];

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', category: 'Work', description: '' });
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);

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
      setError('Connection lost. Please check if the backend server is running.');
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      setIsAdding(true);
      const response = await axios.post(API_URL, newTask);
      if (response.data.success) {
        setTasks([response.data.data, ...tasks]);
        setNewTask({ title: '', priority: 'medium', category: 'Work', description: '' });
        setIsAdding(false);
      }
    } catch (err) {
      setError('Failed to create task.');
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
      setError('Update failed.');
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      if (response.data.success) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (err) {
      setError('Delete failed.');
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percent };
  }, [tasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'All' || task.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="main-layout">
      {/* Sidebar Dashboard */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon"><Layout size={24} /></div>
          <h2>TaskMaster Pro</h2>
        </div>

        <div className="stats-card">
          <div className="stats-header">
            <span>Overall Progress</span>
            <span className="percent">{stats.percent}%</span>
          </div>
          <div className="progress-bar-bg">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-val">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{stats.completed}</span>
              <span className="stat-label">Done</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{stats.pending}</span>
              <span className="stat-label">Left</span>
            </div>
          </div>
        </div>

        <nav className="category-nav">
          <h3>Categories</h3>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`nav-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              <Tag size={16} />
              {cat}
              <span className="count">
                {cat === 'All' ? tasks.length : tasks.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="content-header">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button className="icon-btn"><BarChart2 size={20} /></button>
            <button className="icon-btn"><Calendar size={20} /></button>
          </div>
        </header>

        <section className="task-input-section">
          <form onSubmit={addTask} className="advanced-form">
            <div className="form-main">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              <button type="submit" className="primary-btn" disabled={isAdding}>
                {isAdding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                Add Task
              </button>
            </div>
            <div className="form-extras">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows="1"
              />
            </div>
          </form>
        </section>

        <section className="task-list-section">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="info-state">
                <div className="spinner-large" />
                <p>Syncing your workspace...</p>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="info-state error">
                <AlertCircle size={40} />
                <p>{error}</p>
                <button onClick={fetchTasks} className="secondary-btn">Reconnect</button>
              </motion.div>
            ) : filteredTasks.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="info-state">
                <ClipboardList size={60} strokeWidth={1} />
                <p>No tasks found in this view.</p>
              </motion.div>
            ) : (
              <LayoutGroup>
                <div className="task-grid">
                  {filteredTasks.map((task) => (
                    <motion.div
                      layout
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className={`task-card ${task.completed ? 'is-completed' : ''} priority-${task.priority}`}
                    >
                      <div className="card-top">
                        <motion.div
                          className={`check-circle ${task.completed ? 'checked' : ''}`}
                          onClick={() => toggleComplete(task)}
                          whileTap={{ scale: 0.8 }}
                        >
                          {task.completed && <Check size={14} />}
                        </motion.div>
                        <div className="card-content">
                          <h4 className={task.completed ? 'strikethrough' : ''}>{task.title}</h4>
                          <div className="card-meta">
                            <span className="meta-tag">{task.category}</span>
                            <span className="meta-priority">
                              {/* Render priority icon and label */}
                              {task.priority === 'high' ? <Zap size={12} /> : task.priority === 'low' ? <Target size={12} /> : <Clock size={12} />}
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="card-actions">
                          <button
                            className="expand-btn"
                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          >
                            {expandedTask === task.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedTask === task.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="card-details"
                          >
                            <p>{task.description || 'No description provided.'}</p>
                            <span className="date">Added: {new Date(task.createdAt).toLocaleDateString()}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </LayoutGroup>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default App;
