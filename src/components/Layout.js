import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  CheckSquare,
  Plus,
  Map,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Create Task", href: "/create-task", icon: Plus },
    { name: "Map View", href: "/map", icon: Map },
    { name: "Nearby Tasks", href: "/nearby", icon: MapPin },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-col h-0 flex-1">
          <div className="flex items-center px-4 py-5">
            <h1 className="text-2xl font-bold text-primary-600">TaskManager</h1>
          </div>
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? "bg-primary-100 text-primary-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 flex lg:hidden ${
          sidebarOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black bg-opacity-25 transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative w-64 bg-white shadow-xl transform transition-transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h1 className="text-xl font-bold text-primary-600">TaskManager</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <nav className="px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? "bg-primary-100 text-primary-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between bg-white px-4 py-3 border-b">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold">TaskManager</h1>
          <button onClick={handleLogout}>
            <LogOut className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
