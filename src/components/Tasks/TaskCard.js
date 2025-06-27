import React from "react";
import { Link } from "react-router-dom";

function TaskCard({ task, showDistance = false }) {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold">{task.title}</h3>
      <p className="text-sm text-gray-700 mb-2">{task.description}</p>
      {task.status && (
        <span className="inline-block text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
          {task.status}
        </span>
      )}
      {showDistance && (
        <p className="text-xs text-gray-500 mt-2">
          Distance: {task.distance} km
        </p>
      )}
      <Link
        to={`/tasks/${task.id}`}
        className="text-blue-600 text-sm mt-2 inline-block"
      >
        View Details
      </Link>
    </div>
  );
}

export default TaskCard;
