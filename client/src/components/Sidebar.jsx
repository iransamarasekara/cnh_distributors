import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Squares2X2Icon,
  CubeIcon,
  TruckIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <Squares2X2Icon className="w-5 h-5" />,
      label: "Dashboard",
      url: "/",
    },
    {
      icon: <CubeIcon className="w-5 h-5" />,
      label: "Stock",
      url: "/inventory-management",
    },
    {
      icon: <TruckIcon className="w-5 h-5" />,
      label: "Loading",
      hasDropdown: false,
      url: "/loading-management",
    },
    {
      icon: <DocumentChartBarIcon className="w-5 h-5" />,
      label: "Reports",
      url: "/reports",
    },
    {
      icon: <UserGroupIcon className="w-5 h-5" />,
      label: "Manage",
      url: "/manage",
    },
  ];

  const bottomMenuItems = [
    {
      icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
      label: "Help",
      url: "/help",
    },
  ];

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="bg-white w-52 flex flex-col shadow">
      <div className="p-4">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-400">C&H</span>
        </div>
        <div className="text-blue-400 font-semibold">DISTRIBUTORS</div>
      </div>

      <nav className="flex-1">
        <ul>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.url;

            return (
              <li key={index}>
                <a
                  href={item.url}
                  className={`flex items-center px-4 py-3 hover:bg-gray-100 rounded-r-lg transition ${
                    isActive
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <span className="ml-auto">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t mt-auto">
        <ul>
          {bottomMenuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.url}
                className="flex items-center px-4 py-3 hover:bg-gray-100"
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 hover:bg-gray-100 w-full text-left"
            >
              <span className="mr-3">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
