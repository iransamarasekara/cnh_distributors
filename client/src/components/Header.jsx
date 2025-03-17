import React, { useState, useRef, useEffect } from "react";
import AddNewStockForm from "../components/AddNewStockForm";
import { 
  BellIcon, 
  PencilIcon, 
  UserIcon,
  TruckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArchiveBoxIcon,
  TagIcon
} from "@heroicons/react/24/outline";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Navigation menu items with colors
  const navItems = [
    {
      title: "Loading Transaction",
      icon: <ArrowUpTrayIcon className="h-5 w-5" />,
      onClick: () => console.log("Loading Transaction clicked"),
      color: "bg-blue-100 text-blue-600",
      hoverColor: "bg-blue-200"
    },
    {
      title: "Unloading Transaction",
      icon: <ArrowDownTrayIcon className="h-5 w-5" />,
      onClick: () => console.log("Unloading Transaction clicked"),
      color: "bg-purple-100 text-purple-600",
      hoverColor: "bg-purple-200"
    },
    {
      title: "Add New Stock",
      icon: <ArchiveBoxIcon className="h-5 w-5" />,
      onClick: () => console.log("Add New Stock clicked"),
      color: "bg-green-100 text-green-600",
      hoverColor: "bg-green-200"
    },
    {
      title: "Manage Lorry",
      icon: <TruckIcon className="h-5 w-5" />,
      onClick: () => console.log("Manage Lorry clicked"),
      color: "bg-amber-100 text-amber-600",
      hoverColor: "bg-amber-200"
    },
    {
      title: "Manage Product",
      icon: <TagIcon className="h-5 w-5" />,
      onClick: () => console.log("Manage Product clicked"),
      color: "bg-pink-100 text-pink-600",
      hoverColor: "bg-pink-200"
    },
  ];

  return (
    <header className="bg-white shadow-sm py-5 px-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-blue-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
            placeholder="Search for anything"
          />
        </div>
        <div className="flex items-center space-x-4 ml-4">
          {/* Create button with enhanced styling */}
          <div className="relative" ref={menuRef}>
            <button 
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md text-sm font-medium shadow-sm hover:from-blue-600 hover:to-blue-700 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="mr-1 text-lg font-bold">+</span>
              <span>Create</span>
            </button>
            
            {/* Enhanced popup navigation menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl z-10 overflow-hidden border border-gray-100 transform transition-all duration-200">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600">
                  <h3 className="text-sm font-bold text-white">Quick Navigation</h3>
                </div>
                <div className="py-2">
                  {navItems.map((item, index) => (
                    <button
                      key={index}
                      className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center hover:${item.hoverColor} transition-colors duration-150 ${index !== navItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                      onClick={() => {
                        item.onClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      <span className={`mr-4 rounded-full p-2 ${item.color}`}>{item.icon}</span>
                      <span className="text-gray-700">{item.title}</span>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 bg-gray-50">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1">
                    Close Menu
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors duration-150">
            <BellIcon className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors duration-150">
            <PencilIcon className="h-6 w-6" />
          </button>
          <button className="h-9 w-9 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white flex items-center justify-center hover:from-gray-600 hover:to-gray-700 transition-colors duration-150 shadow-sm">
            <UserIcon className="h-5 w-5" />
            <span className="sr-only">User profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;