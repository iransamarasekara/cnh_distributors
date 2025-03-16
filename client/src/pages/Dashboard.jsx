import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  // Date range state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Helper function to format date range display
  const formatDateRange = () => {
    if (!startDate && !endDate) return "All Time";
    
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    
    if (startDate) {
      return `From ${startDate.toLocaleDateString()}`;
    }
    
    return `Until ${endDate.toLocaleDateString()}`;
  };
  
  // Clear date range function
  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
  };
  
  // Sample data for the bar chart
  const monthlyData = [
    { name: "Jan", value: 310000 },
    { name: "Feb", value: 140000 },
    { name: "Mar", value: 320000 },
    { name: "Apr", value: 250000 },
    { name: "May", value: 70000 },
    { name: "Jun", value: 180000 },
    { name: "Jul", value: 90000 },
    { name: "Aug", value: 210000 },
    { name: "Sep", value: 160000 },
    { name: "Oct", value: 0 },
    { name: "Nov", value: 310000 },
    { name: "Dec", value: 310000 },
  ];

  // Custom date range select component
  const DateRangeSelector = () => (
    <div className="relative inline-block">
      <div className="flex items-center bg-gray-100 border border-gray-200 rounded py-2 px-4 cursor-pointer">
        <span>{formatDateRange()}</span>
        <button 
          onClick={clearDateRange} 
          className="ml-2 text-gray-500 hover:text-gray-700"
          style={{ display: startDate || endDate ? 'block' : 'none' }}
        >
          ×
        </button>
      </div>
      
      <div className="absolute mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2" style={{ width: '300px' }}>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          inline
          className="w-full"
        />
        <div className="border-t border-gray-200 my-2"></div>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          inline
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-blue-50 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left section - 3/4 width */}
        <div className="lg:col-span-3 space-y-4">
          {/* Overview section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Overview</h2>
              <DatePicker
                selected={startDate}
                onChange={(dates) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                customInput={
                  <button className="bg-gray-100 border border-gray-200 rounded py-2 px-4">
                    {startDate && endDate 
                      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                      : "All Time"}
                  </button>
                }
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selling Bottles */}
              <div className="bg-orange-200 p-4 rounded-lg">
                <p className="text-gray-800">Selling Bottles</p>
                <p className="text-2xl font-bold">10,275</p>
              </div>
              
              {/* Sale Income */}
              <div className="bg-teal-200 p-4 rounded-lg">
                <p className="text-gray-800">Sale Income</p>
                <p className="text-2xl font-bold">LKR 453,789.00</p>
              </div>
              
              {/* Gross Profit */}
              <div className="bg-green-400 p-4 rounded-lg">
                <p className="text-gray-800">Gross Profit</p>
                <p className="text-2xl font-bold">LKR 53,829.00</p>
              </div>
            </div>
          </div>
          
          {/* Monthly Best Sales */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Monthly Best Sales products</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Coca Cola */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">Coca Cola 175 mL</p>
                <p className="text-xl font-bold text-center">2,450</p>
              </div>
              
              {/* Sprite 1 */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">Sprite 400 mL</p>
                <p className="text-xl font-bold text-center">5,125</p>
              </div>
              
              {/* Sprite 2 */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">Sprite 400 mL</p>
                <p className="text-xl font-bold text-center">5,125</p>
              </div>
              
              {/* Sprite 3 */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">Sprite 400 mL</p>
                <p className="text-xl font-bold text-center">5,125</p>
              </div>
            </div>
          </div>
          
          {/* Total Income Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Total Income</h2>
              <DatePicker
                selected={startDate}
                onChange={(dates) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                customInput={
                  <button className="bg-gray-100 border border-gray-200 rounded py-2 px-4">
                    {startDate && endDate 
                      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                      : "All Time"}
                  </button>
                }
              />
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `${value/1000}k`}
                    ticks={[0, 100000, 200000, 300000, 400000]}
                  />
                  <Tooltip formatter={(value) => `LKR ${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#4F78FF" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Right section - 1/4 width */}
        <div className="lg:col-span-1 space-y-4">
          {/* Inventory Overview */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Inventory Overview</h2>
            
            {/* Total Bottles */}
            <div className="bg-blue-400 p-4 rounded-lg mb-4 text-center">
              <p className="text-white">Total Bottles</p>
              <p className="text-2xl font-bold text-white">522,345</p>
            </div>
            
            {/* Total Value */}
            <div className="bg-red-500 p-4 rounded-lg text-center">
              <p className="text-white">Total Value</p>
              <p className="text-2xl font-bold text-white">6,452,213.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;