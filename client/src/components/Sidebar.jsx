import React from "react";
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
  const menuItems = [
    {
      icon: <Squares2X2Icon className="w-5 h-5" />,
      label: "Dashboard",
      active: true,
    },
    {
      icon: <CubeIcon className="w-5 h-5" />,
      label: "Stock",
      hasDropdown: true,
    },
    {
      icon: <TruckIcon className="w-5 h-5" />,
      label: "Loading",
      hasDropdown: true,
    },
    {
      icon: <DocumentChartBarIcon className="w-5 h-5" />,
      label: "Reports",
      hasDropdown: true,
    },
    {
      icon: <UserGroupIcon className="w-5 h-5" />,
      label: "Manage",
      hasDropdown: true,
    },
  ];

  const bottomMenuItems = [
    { icon: <QuestionMarkCircleIcon className="w-5 h-5" />, label: "Help" },
    {
      icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />,
      label: "Logout",
    },
  ];

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
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center px-4 py-3 hover:bg-gray-100 ${
                  item.active ? "bg-gray-100" : ""
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
          ))}
        </ul>
      </nav>

      <div className="border-t mt-auto">
        <ul>
          {bottomMenuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className="flex items-center px-4 py-3 hover:bg-gray-100"
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
