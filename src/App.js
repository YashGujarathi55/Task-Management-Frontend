import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import TaskList from "./components/Tasks/TaskList";
import CreateTask from "./components/Tasks/CreateTask";
import TaskMap from "./components/Tasks/TaskMap";
import NearbyTasks from "./components/Tasks/NearbyTasks";
import Profile from "./components/Profile/Profile";
import TaskDetail from "./components/Tasks/TaskDetail";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/create-task" element={<CreateTask />} />
            <Route path="/map" element={<TaskMap />} />
            <Route path="/nearby" element={<NearbyTasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      )}
    </div>
  );
}

export default App;
