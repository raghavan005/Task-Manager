import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import { jwtDecode } from 'jwt-decode';
import Confetti from 'react-confetti'; 


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
  });

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  const [showConfetti, setShowConfetti] = useState(false); 
  const { width, height } = useWindowSize(); 

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
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to local storage:", error);
    }
  }, [tasks]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.title.trim()) {
      alert("Task title cannot be empty!");
      return;
    }
    const newTask = { ...task, id: Date.now() };
    setTasks([...tasks, newTask]);
    setTask({ title: '', description: '', status: 'pending', due_date: '' });
  };

  const handleStatusChange = (id) => {
    let newStatus;
    const updated = tasks.map((t) => {
      if (t.id === id) {
        if (t.status === 'pending') {
          newStatus = 'in_progress';
        } else if (t.status === 'in_progress') {
          newStatus = 'completed';
        } else {
          newStatus = 'pending';
        }

       
        if (newStatus === 'completed') {
          setShowConfetti(true);
        
          setTimeout(() => {
            setShowConfetti(false);
          }, 4000); 
        }
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(updated);
  };

  const handleDelete = (id) => {
    setTaskToDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    setTasks(tasks.filter((t) => t.id !== taskToDeleteId));
    setShowConfirmModal(false);
    setTaskToDeleteId(null);
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

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    const updatedTasks = tasks.map((taskItem) => {
      if (taskItem.id === taskId) {
      
        if (newStatus === 'completed') {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
          }, 4000); 
        }
        return { ...taskItem, status: newStatus };
      }
      return taskItem;
    });
    setTasks(updatedTasks);
  };

  const filterTasksByStatus = (status) => {
    return tasks.filter(taskItem => taskItem.status === status);
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

  return (
    <motion.div
      className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white font-inter"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
 
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
        className="text-3xl font-bold mb-10 text-center"
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
            <input
              type="date"
              name="due_date"
              value={task.due_date}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
            <motion.button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md text-lg font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Task
            </motion.button>
          </motion.form>
        </motion.div>

        <div className="md:w-2/3 w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                {filterTasksByStatus(statusKey).length === 0 ? (
                  <motion.p
                    className="text-center text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {`No ${statusKey.replace('_', ' ')} tasks.`}
                  </motion.p>
                ) : (
                  <AnimatePresence>
                    {filterTasksByStatus(statusKey).map((taskItem) => (
                      <motion.div
                        key={taskItem.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, taskItem.id)}
                        className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing flex flex-col justify-between"
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
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m7-9v8h8m-1 0c-1.57-.457-3.179-.625-4.8-.57l-1-.02m1-1.424V4.776a2.002 2.002 0 00-1.414-1.414l-1.414-.707a2.002 2.002 0 00-1.414-1.414L7 0.96a2.002 2.002 0 00-1.414 1.414L4.776 3.776a2.002 2.002 0 00-1.414 1.414l-.707 1.414A2.002 2.002 0 000.96 7L.96 12a2.002 2.002 0 001.414 1.414L3.776 14.224a2.002 2.002 0 001.414 1.414l1.414.707a2.002 2.002 0 001.414 1.414L12 17.04a2.002 2.002 0 001.414-1.414L14.224 14.224a2.002 2.002 0 001.414-1.414l.707-1.414A2.002 2.002 0 0017.04 10L17.04 5a2.002 2.002 0 00-1.414-1.414L14.224 2.376a2.002 2.002 0 00-1.414-1.414L12 0.96z" />
                            </svg>
                            Status
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(taskItem.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm flex items-center text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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