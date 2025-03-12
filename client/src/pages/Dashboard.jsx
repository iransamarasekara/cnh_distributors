import React from "react";
import DashboardCard from "../components/DashboardCard";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <DashboardCard height="h-64" />
      </div>
      <div className="col-span-1">
        <DashboardCard height="h-64" />
      </div>
      <div className="col-span-2">
        <DashboardCard height="h-48" />
      </div>
      <div className="col-span-1">
        <DashboardCard height="h-48" />
      </div>
    </div>
  );
};

export default Dashboard;
