import React, { useEffect, useState } from "react";
import { taskService } from "../../services/taskService";
import { useAuth } from "../../contexts/AuthContext";
import TaskCard from "../Tasks/TaskCard";

function Profile() {
  const { user } = useAuth();
  const [createdTasks, setCreatedTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const createdRes = await taskService.getTasks({ created_by_me: true });
        const assignedRes = await taskService.getTasks({
          assigned_to_me: true,
        });
        setCreatedTasks(createdRes.tasks);
        setAssignedTasks(assignedRes.tasks);
      } catch (error) {
        console.error("Error loading profile tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">My Profile</h2>
      <p className="text-sm text-gray-600 mb-6">
        Logged in as:{" "}
        <span className="font-medium">{user?.name || "User"}</span> (
        {user?.email})
      </p>

      {loading ? (
        <p>Loading your tasks...</p>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tasks Created By Me</h3>
            {createdTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks created.</p>
            ) : (
              <div className="space-y-3">
                {createdTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Tasks Assigned To Me</h3>
            {assignedTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks assigned.</p>
            ) : (
              <div className="space-y-3">
                {assignedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
