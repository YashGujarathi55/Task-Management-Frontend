import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { Edit, Trash2, MapPin, User, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, [filter, statusFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Add status filter if selected
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      // Add user-specific filters
      if (filter === 'created') {
        params.created_by_me = 'true';
      } else if (filter === 'assigned') {
        params.assigned_to_me = 'true';
      }
      // For 'all' filter, don't add any user-specific filters
      
      const response = await taskService.getTasks(params);
      
      // The taskService.getTasks already returns response.data, 
      // so we access tasks directly from the response
      setTasks(response.tasks || []);
    } catch (error) {
      toast.error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
        console.error('Error deleting task:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="created">Created by Me</option>
            <option value="assigned">Assigned to Me</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h3>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  {task.created_by === user?.id && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {task.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm">{task.address}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-2" />
                  <span className="text-sm">
                    Created by: {task.creator?.username || 'Unknown'}
                  </span>
                </div>
                {task.assignee && (
                  <div className="flex items-center text-gray-600">
                    <User size={16} className="mr-2" />
                    <span className="text-sm">
                      Assigned to: {task.assignee.username}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {task.image_path && (
                <div className="mb-4">
                  <img
                    src={`http://localhost:5000/${task.image_path}`}
                    alt="Task"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {(task.created_by === user?.id || task.assigned_to === user?.id) && (
                    <>
                      {task.status !== 'Pending' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'Pending')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                        >
                          Set Pending
                        </button>
                      )}
                      {task.status !== 'In Progress' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'In Progress')}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          Set In Progress
                        </button>
                      )}
                      {task.status !== 'Done' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'Done')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Mark Done
                        </button>
                      )}
                    </>
                  )}
                </div>
                {task.latitude && task.longitude && (
                  <div className="text-gray-500 text-sm">
                    📍 {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;