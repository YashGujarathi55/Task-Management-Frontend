import React, { useEffect, useState } from "react";
import { taskService, locationService } from "../../services/taskService";
import TaskCard from "./TaskCard.js"; // Create this if not exists

function NearbyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);

  const fetchNearbyTasks = async (lat, lng) => {
    try {
      const res = await taskService.getNearbyTasks(lat, lng, radius, status);
      setTasks(res.tasks);
    } catch (err) {
      setError("Failed to fetch nearby tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    locationService
      .getCurrentPosition()
      .then(({ latitude, longitude }) => {
        fetchNearbyTasks(latitude, longitude);
      })
      .catch((err) => {
        setError("Unable to get location. Please allow location access.");
        setLoading(false);
      });
  }, [radius, status]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Nearby Tasks</h2>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div>
          <label className="text-sm block mb-1">Radius (km)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="border px-2 py-1 rounded w-24"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading nearby tasks...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && tasks.length === 0 && (
        <p>No tasks found nearby within {radius} km.</p>
      )}
      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} showDistance />
          ))}
        </div>
      )}
    </div>
  );
}

export default NearbyTasks;
