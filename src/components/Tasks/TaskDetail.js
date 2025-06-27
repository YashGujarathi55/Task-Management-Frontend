import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskService, userService } from "../../services/taskService";

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [isAssignee, setIsAssignee] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await taskService.getTask(id);
        setTask(res.task);
        setStatus(res.task.status || "Pending");
        setAssignedTo(res.task.assigned_to || "");
        setIsCreator(
          res.task.created_by === JSON.parse(localStorage.getItem("user"))?.id
        );
        setIsAssignee(
          res.task.assigned_to === JSON.parse(localStorage.getItem("user"))?.id
        );
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
  }, [id]);

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
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
      {task.image_path && (
        <img
          src={`http://localhost:5000/${task.image_path}`}
          alt="Task"
          className="mb-4 rounded shadow w-full"
        />
      )}
      <p className="mb-2">
        <strong>Description:</strong> {task.description}
      </p>
      <p className="mb-2">
        <strong>Address:</strong> {task.address}
      </p>
      <p className="mb-2">
        <strong>Created At:</strong>{" "}
        {new Date(task.created_at).toLocaleString()}
      </p>
      <p className="mb-2">
        <strong>Status:</strong> {task.status}
      </p>

      {(isCreator || isAssignee) && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Update Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border px-2 py-1 rounded"
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
                className="border px-2 py-1 rounded"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Task
            </button>
            {isCreator && (
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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
