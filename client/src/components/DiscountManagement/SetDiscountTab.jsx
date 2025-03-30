import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SetDiscountTab = ({ shops, onSetDiscount }) => {
  const [selectedShop, setSelectedShop] = useState("");
  const [discountLimit, setDiscountLimit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [shopDetails, setShopDetails] = useState(null);

  // Reset form
  const resetForm = () => {
    setDiscountLimit("");
    setStartDate("");
    setEndDate("");
  };

  // Fetch shop details when shop selection changes
  useEffect(() => {
    if (!selectedShop) {
      setShopDetails(null);
      return;
    }

    const fetchShopDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/shops/${selectedShop}`);
        setShopDetails(response.data);

        // Pre-fill existing values if available
        if (response.data.discountLimit) {
          setDiscountLimit(response.data.discountLimit);
        }
        if (response.data.discountStartDate) {
          setStartDate(response.data.discountStartDate.split("T")[0]);
        }
        if (response.data.discountEndDate) {
          setEndDate(response.data.discountEndDate.split("T")[0]);
        }
      } catch (err) {
        console.error("Failed to fetch shop details:", err);
        setStatus({
          type: "error",
          message: "Failed to fetch shop details.",
        });
      }
    };

    fetchShopDetails();
  }, [selectedShop]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedShop || !discountLimit || !startDate || !endDate) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    if (parseFloat(discountLimit) <= 0) {
      setStatus({
        type: "error",
        message: "Discount limit must be greater than zero.",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setStatus({
        type: "error",
        message: "Start date cannot be after end date.",
      });
      return;
    }

    const discountData = {
      shopId: selectedShop,
      discountLimit: parseFloat(discountLimit),
      startDate,
      endDate,
    };

    const result = await onSetDiscount(discountData);

    if (result.success) {
      setStatus({
        type: "success",
        message: "Discount limits set successfully!",
      });
      resetForm();
    } else {
      setStatus({
        type: "error",
        message: result.error || "Failed to set discount limits.",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Set Discount Limits</h2>

      {status.message && (
        <div
          className={`mb-4 p-3 rounded ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg">
        {/* Shop Selection */}
        <div className="mb-4">
          <label
            htmlFor="shop"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Shop
          </label>
          <select
            id="shop"
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name} ({shop.type})
              </option>
            ))}
          </select>
        </div>

        {shopDetails && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Current Shop Settings</h3>
            <div className="text-sm">
              <div>Shop Name: {shopDetails.name}</div>
              <div>Shop Type: {shopDetails.type}</div>
              {shopDetails.discountLimit && (
                <div>Current Discount Limit: {shopDetails.discountLimit}</div>
              )}
              {shopDetails.discountStartDate && shopDetails.discountEndDate && (
                <div>
                  Current Validity:{" "}
                  {shopDetails.discountStartDate.split("T")[0]} to{" "}
                  {shopDetails.discountEndDate.split("T")[0]}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discount Limit */}
        <div className="mb-4">
          <label
            htmlFor="discountLimit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Discount Limit
          </label>
          <input
            type="number"
            id="discountLimit"
            min="0"
            step="0.01"
            value={discountLimit}
            onChange={(e) => setDiscountLimit(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The maximum discount amount that can be applied for this shop.
          </p>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Set Discount Limits
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetDiscountTab;
