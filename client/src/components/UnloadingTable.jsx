import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const UnloadingTable = ({ selectedLorry, dateRange }) => {
  const [unloadingData, setUnloadingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUnloadingData = async () => {
      try {
        setIsLoading(true);
        const params = {};

        if (selectedLorry) {
          params.lorry_id = selectedLorry;
        }

        if (dateRange.startDate && dateRange.endDate) {
          params.startDate = dateRange.startDate;
          params.endDate = dateRange.endDate;
        }

        const response = await axios.get(`${API_URL}/unloading-transactions`, {
          params,
        });
        setUnloadingData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch unloading transactions");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnloadingData();
  }, [selectedLorry, dateRange]);

  if (isLoading)
    return <div className="text-center py-4">Loading transactions...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;
  if (unloadingData.length === 0)
    return (
      <div className="text-center py-4">No unloading transactions found</div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lorry
            </th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unloaded By
            </th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Products
            </th>
            <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {unloadingData.map((transaction) => (
            <tr key={transaction.unloading_id} className="hover:bg-gray-50">
              <td className="py-2 px-4 text-sm text-gray-900">
                {transaction.unloading_id}
              </td>
              <td className="py-2 px-4 text-sm text-gray-900">
                {transaction.lorry?.lorry_number || "N/A"}
              </td>
              <td className="py-2 px-4 text-sm text-gray-900">
                {new Date(transaction.unloading_date).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 text-sm text-gray-900">
                {transaction.unloading_time}
              </td>
              <td className="py-2 px-4 text-sm text-gray-900">
                {transaction.unloaded_by}
              </td>
              <td className="py-2 px-4 text-sm">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${
                    transaction.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : transaction.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {transaction.status}
                </span>
              </td>
              <td className="py-2 px-4 text-sm text-gray-900">
                {transaction.unloadingDetails?.length || 0} products
              </td>
              <td className="py-2 px-4 text-sm text-gray-500 flex space-x-2">
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() =>
                    alert(
                      `View details for unloading ID: ${transaction.unloading_id}`
                    )
                  }
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnloadingTable;
