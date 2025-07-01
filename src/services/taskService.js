import api from "./api";

export const taskService = {
  // Create a new task
  createTask: async (taskData) => {
    const formData = new FormData();

    Object.entries(taskData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    const response = await api.post("/tasks/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Get all tasks with filters
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== null &&
        filters[key] !== undefined &&
        filters[key] !== ""
      ) {
        params.append(key, filters[key]);
      }
    });

    const queryString = params.toString();
    const url = `/tasks/${queryString ? "?" + queryString : ""}`;

    const response = await api.get(url);
    return response.data;
  },

  // Get a specific task
  getTask: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Get nearby tasks
  getNearbyTasks: async (latitude, longitude, radius = 10, status = null) => {
    const payload = {
      latitude,
      longitude,
      radius,
    };

    if (status) {
      payload.status = status;
    }

    const response = await api.post("/tasks/nearby", payload);
    return response.data;
  },
};

export const userService = {
  // Get all users
  getUsers: async () => {
    const response = await api.get("/users/");
    return response.data;
  },

  // Get a specific user
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export const locationService = {
  // Get current position using browser geolocation
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  },
};
