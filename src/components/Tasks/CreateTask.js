import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskService, userService } from "../../services/taskService";
import { useAuth } from "../../contexts/AuthContext";

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isAssignee, setIsAssignee] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await taskService.getTask(id);
        const task = res.task;

        setTask(task);
        setStatus(task.status || "Pending");
        setAssignedTo(task.assigned_to || "");

        if (user) {
          setIsCreator(task.created_by === user.id);
          setIsAssignee(task.assigned_to === user.id);
        }
      } catch (err) {
        setError("Failed to fetch task details.");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        setUsers(res.users || []);
      } catch (err) {
        console.error("Failed to fetch users");
      }
    };

    fetchTask();
    fetchUsers();
  }, [id, user]);

  const handleUpdate = async () => {
    try {
      await taskService.updateTask(id, {
        status,
        assigned_to: isCreator ? assignedTo : undefined,
      });
      alert("Task updated.");
      navigate("/tasks");
    } catch (err) {
      alert("Failed to update task.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.deleteTask(id);
        alert("Task deleted.");
        navigate("/tasks");
      } catch (err) {
        alert("Failed to delete task.");
      }
    }
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!task) return <div className="p-4">Loading task...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-2">
        {task.title}
      </h2>

      {task.image_path && (
        <img
          src={`http://localhost:5000/${task.image_path}`}
          alt="Task"
          className="rounded-lg w-full max-h-[400px] object-cover shadow"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <span className="font-semibold">Description:</span> {task.description}
        </div>
        <div>
          <span className="font-semibold">Address:</span> {task.address}
        </div>
        <div>
          <span className="font-semibold">Created At:</span>{" "}
          {new Date(task.created_at).toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`inline-block px-2 py-1 rounded text-white text-xs ${
              task.status === "Done"
                ? "bg-green-600"
                : task.status === "In Progress"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`}
          >
            {task.status}
          </span>
        </div>

        {task.creator && (
          <div>
            <span className="font-semibold">Created by:</span>{" "}
            {task.creator.username} ({task.creator.email})
          </div>
        )}
        {task.assignee && (
          <div>
            <span className="font-semibold">Assigned to:</span>{" "}
            {task.assignee.username} ({task.assignee.email})
          </div>
        )}
      </div>

      {(isCreator || isAssignee) && (
        <div className="border-t pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Update Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {isCreator && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Reassign Task
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Update Task
            </button>

            {isCreator && (
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete Task
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDetail;
