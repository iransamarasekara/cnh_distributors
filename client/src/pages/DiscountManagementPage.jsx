import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// These would be your actual components
// import DiscountTable from "../components/DiscountTable";
// import AddNewDiscountForm from "../components/AddNewDiscountForm";
// import DiscountHistory from "../components/DiscountHistory";

const DiscountManagementPage = () => {
  const [activeTab, setActiveTab] = useState("Active Discounts");
  const [sortOption, setSortOption] = useState("Expiration");
  const [discountData, setDiscountData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // For filters
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [searchParams] = useSearchParams();

  const tabs = ["Active Discounts", "Add New Discount", "Discount History"];

  useEffect(() => {
    searchParams.get("tab") &&
      searchParams.get("tab") === "add-new-discount" &&
      setActiveTab("Add New Discount");
  }, [searchParams]);

  // Fetch discount data
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setIsLoading(true);
        const params = {};

        if (selectedType) {
          params.type = selectedType;
        }

        if (selectedProduct) {
          params.product = selectedProduct;
        }

        if (sortOption) {
          params.sortBy = sortOption;
        }

        const response = await axios.get(`${API_URL}/discounts`, { params });

        setDiscountData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch discount data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch available discount types for filtering
    const fetchTypes = async () => {
      try {
        const response = await axios.get(`${API_URL}/discounts/types`);
        setAvailableTypes(response.data);
      } catch (err) {
        console.error("Failed to fetch discount types:", err);
      }
    };

    // Fetch available products for filtering
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/names`);
        setAvailableProducts(response.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchDiscounts();
    fetchTypes();
    fetchProducts();
  }, [selectedType, selectedProduct, sortOption]);

  // Handle sort change
  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Handle type filter change
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  // Handle product filter change
  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  // Function to refresh discount data
  const refreshDiscounts = async () => {
    try {
      setIsLoading(true);
      const params = {};

      if (selectedType) {
        params.type = selectedType;
      }

      if (selectedProduct) {
        params.product = selectedProduct;
      }

      if (sortOption) {
        params.sortBy = sortOption;
      }

      const response = await axios.get(`${API_URL}/discounts`, { params });

      setDiscountData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to refresh discount data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto p-4">
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

      {activeTab === "Active Discounts" && (
        <div className="mt-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">Filters</p>
              <div className="flex space-x-4 mb-4">
                {/* Discount Type Filter */}
                <div className="relative">
                  <select
                    className="appearance-none border border-gray-300 rounded px-4 py-2 pr-8 bg-white text-gray-700 w-40 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedType}
                    onChange={handleTypeChange}
                  >
                    <option value="">All Types</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
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

                {/* Product Filter */}
                <div className="relative">
                  <select
                    className="appearance-none border border-gray-300 rounded px-4 py-2 pr-8 bg-white text-gray-700 w-40 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedProduct}
                    onChange={handleProductChange}
                  >
                    <option value="">All Products</option>
                    {availableProducts.map((product) => (
                      <option key={product} value={product}>
                        {product}
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
                {["Expiration", "Amount", "Type"].map((option) => (
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
            <div className="text-center py-6">Loading discount data...</div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">{error}</div>
          ) : (
            <DiscountTable discountData={discountData} onRefresh={refreshDiscounts} />
          )}
        </div>
      )}

      {activeTab === "Add New Discount" && (
        <div className="mt-6">
          <AddNewDiscountForm onDiscountAdded={refreshDiscounts} />
        </div>
      )}

      {activeTab === "Discount History" && (
        <div className="mt-6">
          <DiscountHistory />
        </div>
      )}
    </div>
  );
};

export default DiscountManagementPage;