import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import { jwtDecode } from 'jwt-decode';
import Confetti from 'react-confetti';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    due_date: '',
    priority: 'medium',
  });
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  const [showInsightsDropdown, setShowInsightsDropdown] = useState(false); 
  const insightsDropdownRef = useRef(null); 

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || decoded.sub || 'User');
      } catch (err) {
        console.error('Failed to decode token:', err);
        localStorage.removeItem('token');
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTasks();
        setTasks(data);

        data.forEach(taskItem => {
          if (taskItem.due_date && taskItem.status !== 'completed' && new Date(taskItem.due_date) < new Date()) {
            toast.warn(`Task "${taskItem.title}" is overdue!`, {
              position: "bottom-left",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
        });
      } catch (error) {
        console.error("Failed to fetch tasks from server:", error);
        toast.error("Failed to load tasks.");
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.title.trim()) {
      toast.error("Task title cannot be empty!");
      return;
    }

    setIsLoading(true);
    try {
      if (editingTask) {
        const updatedTask = await updateTask(editingTask.id, task);
        setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
        setEditingTask(null);
        toast.success("Task updated successfully!", { theme: "colored" });
      } else {
        const newTask = await createTask(task);
        setTasks([...tasks, newTask]);
        toast.success("Task added successfully!", { theme: "colored" });
      }
      setTask({ title: '', description: '', status: 'pending', due_date: '', priority: 'medium' });
    } catch (err) {
      console.error("Failed to save task:", err);
      toast.error("Failed to save task.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (taskItem) => {
    setEditingTask(taskItem);
    setTask({
      title: taskItem.title,
      description: taskItem.description,
      status: taskItem.status,
      due_date: taskItem.due_date,
      priority: taskItem.priority || 'medium',
    });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setTask({ title: '', description: '', status: 'pending', due_date: '', priority: 'medium' });
  };

  const handleStatusChange = async (id) => {
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    let newStatus;
    if (taskToUpdate.status === 'pending') newStatus = 'in_progress';
    else if (taskToUpdate.status === 'in_progress') newStatus = 'completed';
    else newStatus = 'pending';

    setIsLoading(true);
    try {
      const updatedTask = { ...taskToUpdate, status: newStatus };
      await updateTask(id, updatedTask);
      setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));

      if (newStatus === 'completed') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        toast.success("Task marked as completed!", { theme: "colored" });
      } else {
        toast.info(`Task status changed to ${newStatus.replace('_', ' ')}.`, { theme: "colored" });
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
      toast.error("Failed to update task status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    setTaskToDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteTask(taskToDeleteId);
      setTasks(tasks.filter((t) => t.id !== taskToDeleteId));
      setShowConfirmModal(false);
      setTaskToDeleteId(null);
      toast.error("Task deleted successfully!", { theme: "colored" });
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Failed to delete task.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setTaskToDeleteId(null);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    const taskToUpdate = tasks.find(taskItem => taskItem.id === taskId);

    if (taskToUpdate && taskToUpdate.status !== newStatus) {
      setIsLoading(true);
      try {
        const updatedTask = { ...taskToUpdate, status: newStatus };
        await updateTask(taskId, updatedTask);
        setTasks(tasks.map(t => (t.id === taskId ? updatedTask : t)));

        if (newStatus === 'completed') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
          toast.success("Task marked as completed!", { theme: "colored" });
        } else {
          toast.info(`Task moved to ${newStatus.replace('_', ' ')}.`, { theme: "colored" });
        }
      } catch (err) {
        console.error("Failed to update task status via drag and drop:", err);
        toast.error("Failed to update task status.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getFilteredAndSearchedTasks = (columnStatus) => {
    return tasks.filter(taskItem => {
      const matchesColumnStatus = taskItem.status === columnStatus;
      const matchesSearch = taskItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (taskItem.description && taskItem.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesColumnStatus && matchesSearch &&
        (filterStatus === 'all' || taskItem.status === filterStatus);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const taskCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 14
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const getStatusBorderClasses = (status) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-500 dark:border-yellow-400';
      case 'in_progress':
        return 'border-blue-500 dark:border-blue-400';
      case 'completed':
        return 'border-green-500 dark:border-green-400';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  const getPriorityDisplay = (priority) => {
    switch (priority) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      default:
        return 'Medium';
    }
  };

  // --- Dashboard Stats Calculations ---
  const totalTasks = tasks.length;
  const tasksCompleted = tasks.filter(task => task.status === 'completed').length;
  const tasksDueToday = tasks.filter(task => {
    if (!task.due_date || task.status === 'completed') return false;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const taskStatusData = [
    { name: 'Completed', value: tasksCompleted },
    { name: 'Pending', value: tasks.filter(task => task.status === 'pending').length },
    { name: 'In Progress', value: tasks.filter(task => task.status === 'in_progress').length },
  ];

  const PIE_COLORS = ['#82ca9d', '#FFBB28', '#0088FE']; // Green, Yellow, Blue for Completed, Pending, In Progress

  return (
    <motion.div
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white font-inter"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300}
          recycle={false}
          initialVelocityY={{ min: 5, max: 20 }}
          colors={['#FFC0CB', '#FFD700', '#ADFF2F', '#87CEEB', '#FF6347', '#EE82EE']}
        />
      )}

      <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
        <ThemeToggle />

      
        <div className="relative" ref={insightsDropdownRef}>
          <motion.button
            onClick={() => setShowInsightsDropdown(!showInsightsDropdown)}
            className="flex items-center space-x-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a3 3 0 013 3v4a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm0 7a3 3 0 013-3h10a3 3 0 013 3v4a3 3 0 01-3 3H6a3 3 0 01-3-3v-4z" clipRule="evenodd" />
            </svg>
            <span>Insights</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform duration-200 ${showInsightsDropdown ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          <AnimatePresence>
            {showInsightsDropdown && (
              <motion.div
                className="absolute right-0 mt-2 w-72 md:w-96 lg:w-[400px] bg-white dark:bg-gray-800 rounded-md shadow-lg py-4 px-3 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h3 className="text-xl font-semibold mb-3 text-center dark:text-white">Dashboard Insights</h3>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center shadow-sm">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTasks}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center shadow-sm">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{tasksCompleted}</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center shadow-sm">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Due Today</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{tasksDueToday}</p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold mb-3 text-center dark:text-white">Task Status Distribution</h4>
                <div className="h-60 w-70 flex  justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card-light)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown (existing) */}
        <div className="relative" ref={profileDropdownRef}>
          <motion.button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>{username}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-150 shadow-md"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.h1
        className="text-3xl font-bold mb-6 sm:mb-10 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.1 }}
      >
        Task Manager
      </motion.h1>

      <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
        <motion.div
          className="md:w-1/3 w-full flex flex-col items-center justify-start py-6"
          variants={itemVariants}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl space-y-4 border border-gray-200 dark:border-gray-700 w-full max-w-xl"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-center dark:text-white">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <input
              type="text"
              name="title"
              value={task.title}
              onChange={handleChange}
              placeholder="Task Title"
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <textarea
              name="description"
              value={task.description}
              onChange={handleChange}
              placeholder="Task Description"
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
            />
            <select
              name="status"
              value={task.status}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              name="priority"
              value={task.priority}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="date"
              name="due_date"
              value={task.due_date}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-3">
              <motion.button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md text-lg font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (editingTask ? 'Update Task' : 'Add Task')}
              </motion.button>
              {editingTask && (
                <motion.button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md text-lg font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  Cancel Edit
                </motion.button>
              )}
            </div>
          </motion.form>
        </motion.div>

        <div className="md:w-2/3 w-full">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {['pending', 'in_progress', 'completed'].map((statusKey) => (
                <motion.div
                  key={statusKey}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 min-h-[400px] flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, statusKey)}
                  variants={itemVariants}
                >
                  <motion.h2
                    className={`text-xl font-bold mb-4 text-center ${
                      statusKey === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                        statusKey === 'in_progress' ? 'text-blue-600 dark:text-blue-400' :
                          'text-green-600 dark:text-green-400'
                      }`}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {statusKey.replace('_', ' ').charAt(0).toUpperCase() + statusKey.replace('_', ' ').slice(1)}
                  </motion.h2>

                  <motion.div
                    className="flex-grow space-y-4 overflow-y-auto pr-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {getFilteredAndSearchedTasks(statusKey).length === 0 ? (
                      <motion.p
                        className="text-center text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {`No ${statusKey.replace('_', ' ')} tasks matching your criteria.`}
                      </motion.p>
                    ) : (
                      <AnimatePresence>
                        {getFilteredAndSearchedTasks(statusKey).map((taskItem) => (
                          <motion.div
                            key={taskItem.id}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, taskItem.id)}
                            className={`p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md border-l-4 ${getStatusBorderClasses(taskItem.status)} cursor-grab active:cursor-grabbing flex flex-col justify-between`}
                            variants={taskCardVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <div>
                              <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{taskItem.title}</h3>
                              {taskItem.description && (
                                <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">{taskItem.description}</p>
                              )}
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                Status: <span className={`capitalize font-medium px-2 py-0.5 rounded-full text-xs ${
                                  taskItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                    taskItem.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                                      'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  }`}>
                                  {taskItem.status.replace('_', ' ')}
                                </span>
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                Priority: <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                                  taskItem.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                                    taskItem.priority === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100' :
                                      'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  }`}>
                                  {getPriorityDisplay(taskItem.priority)}
                                </span>
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                Due: {taskItem.due_date ? new Date(taskItem.due_date).toLocaleDateString() : 'None'}
                              </p>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <motion.button
                                onClick={() => handleStatusChange(taskItem.id)}
                                className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm flex items-center text-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m7-9v8h8m-1 0c-1.57-.457-3.179-.625-4.8-.57l-1-.02m1-1.424V4.776a2.002 2.002 0 00-1.414-1.414l-1.414-.707a2.002 2.002 0 00-1.414-1.414L7 0.96a2.002 2.002 0 00-1.414 1.414L4.776 3.776a2.002 2.002 0 00-1.414 1.414l-.707 1.414A2.002 2.002 0 000.96 7L.96 12a2.002 2.002 0 001.414 1.414L3.776 14.224a2.002 2.002 0 001.414 1.414l1.414.707a2.002 2.002 0 001.414 1.414L12 17.04a2.002 2.002 0 001.414-1.414L14.224 14.224a2.002 2.002 0 001.414-1.414l.707-1.414A2.002 2.002 0 0017.04 10L17.04 5a2.002 2.002 0 00-1.414-1.414L14.224 2.376a2.002 2.002 0 00-1.414-1.414L12 0.96z" />
                                </svg>
                                Status
                              </motion.button>
                              <motion.button
                                onClick={() => handleEdit(taskItem)}
                                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center text-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit
                              </motion.button>
                              <motion.button
                                onClick={() => handleDelete(taskItem.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm flex items-center text-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full border border-gray-200 dark:border-gray-700"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Confirm Deletion</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  onClick={cancelDelete}
                  className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}