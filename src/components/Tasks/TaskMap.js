import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { taskService, locationService } from "../../services/taskService";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TaskMap = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await taskService.getTasks();
        const filtered = res.tasks.filter(
          (task) => task.latitude && task.longitude
        );
        setTasks(filtered);
      } catch (err) {
        console.error("Error loading tasks for map:", err);
      }
    };

    loadTasks();
  }, []);
  const [defaultCenter, setDefaultCenter] = useState({
    lat: 19.076,
    lng: 72.8777,
  });

  useEffect(() => {
    locationService.getCurrentPosition().then((position) => {
      setDefaultCenter({
        lat: position.latitude,
        lng: position.longitude,
      });
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Task Map</h2>
      <MapContainer
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "75vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {tasks.map((task) => (
          <Marker key={task.id} position={[task.latitude, task.longitude]}>
            <Popup>
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm">{task.status}</p>
                <Link
                  to={`/tasks/${task.id}`}
                  className="text-blue-600 text-xs mt-2 inline-block"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TaskMap;
