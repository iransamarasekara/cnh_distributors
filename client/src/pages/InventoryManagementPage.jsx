import React, { useState, useEffect } from "react";
import InventoryTable from "../components/InventoryTable";
import AddNewStockForm from "../components/AddNewStockForm";
import InventoryHistory from "../components/InventoryHistory"; // Added missing import
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const InventoryManagementPage = () => {
  const [activeTab, setActiveTab] = useState("Available Stock");
  const [sortOption, setSortOption] = useState("Size");
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // For filters
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const tabs = [
    "Available Stock",
    "Add New Stock",
    "Stock History",
    "Overview",
  ];

  // Fetch product data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        const params = {};

        if (selectedSize) {
          params.size = selectedSize;
        }

        if (selectedBrand) {
          params.brand = selectedBrand;
        }

        if (sortOption) {
          params.sortBy = sortOption;
        }

        const response = await axios.get(`${API_URL}/products`, { params });

        setInventoryData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch inventory data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch available sizes for filtering
    const fetchSizes = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/sizes`);
        setAvailableSizes(response.data);
      } catch (err) {
        console.error("Failed to fetch sizes:", err);
      }
    };

    // Fetch available brands for filtering
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/brands`);
        setAvailableBrands(response.data);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      }
    };

    fetchInventory();
    fetchSizes();
    fetchBrands();
  }, [selectedSize, selectedBrand, sortOption]);

  // Handle sort change
  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Handle size filter change
  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
  };

  // Handle brand filter change
  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
  };

  // Function to refresh inventory data
  const refreshInventory = async () => {
    try {
      setIsLoading(true);
      const params = {};

      if (selectedSize) {
        params.size = selectedSize;
      }

      if (selectedBrand) {
        params.brand = selectedBrand;
      }

      if (sortOption) {
        params.sortBy = sortOption;
      }

      const response = await axios.get(`${API_URL}/products`, { params });

      setInventoryData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to refresh inventory data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="border-b-2 border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`py-3 px-6 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "Available Stock" && (
        <div className="mt-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">Filters</p>
              <div className="flex space-x-4 mb-4">
                {/* Size Filter */}
                <div className="relative">
                  <select
                    className="appearance-none border border-gray-300 rounded px-4 py-2 pr-8 bg-white text-gray-700 w-40 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSize}
                    onChange={handleSizeChange}
                  >
                    <option value="">All Sizes</option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="relative">
                  <select
                    className="appearance-none border border-gray-300 rounded px-4 py-2 pr-8 bg-white text-gray-700 w-40 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedBrand}
                    onChange={handleBrandChange}
                  >
                    <option value="">All Brands</option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Sort by</p>
              <div className="flex space-x-4">
                {["Size", "Brand", "Count"].map((option) => (
                  <div key={option} className="relative">
                    <button
                      className={`border border-gray-300 rounded px-4 py-2 bg-white text-gray-700 w-32 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        sortOption === option
                          ? "bg-blue-50 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleSortChange(option)}
                    >
                      {option}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-6">Loading inventory data...</div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">{error}</div>
          ) : (
            <InventoryTable inventoryData={inventoryData} />
          )}
        </div>
      )}

      {activeTab === "Add New Stock" && (
        <div className="mt-6">
          <AddNewStockForm onInventoryAdded={refreshInventory} />
        </div>
      )}

      {activeTab === "Stock History" && (
        <div className="mt-6">
          <InventoryHistory />
        </div>
      )}

      {activeTab === "Overview" && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">Inventory Overview</h2>
          {/* You can implement your overview dashboard here */}
          <p>Overview statistics will go here</p>
        </div>
      )}
    </div>
  );
};

export default InventoryManagementPage;
