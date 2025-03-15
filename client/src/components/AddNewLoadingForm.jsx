import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AddNewLoadingForm = ({ onLoadingAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lorries, setLorries] = useState([]);
  const [products, setProducts] = useState([]);
  // Group products by name and size for filtering
  const [productNames, setProductNames] = useState([]);
  const [productSizes, setProductSizes] = useState([]);
  const [loadingItems, setLoadingItems] = useState([
    {
      product_id: "",
      product_name: "",
      product_size: "",
      cases_loaded: 0,
      bottles_loaded: 0,
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    lorry_id: "",
    loading_date: new Date().toISOString().split("T")[0],
    loading_time: new Date().toTimeString().split(" ")[0],
    loaded_by: "",
    status: "Pending",
  });

  // Fetch lorries and products on component mount
  useEffect(() => {
    const fetchLorries = async () => {
      try {
        const response = await axios.get(`${API_URL}/lorries`);
        setLorries(response.data);
      } catch (err) {
        console.error("Failed to fetch lorries:", err);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`);
        setProducts(response.data);

        // Extract unique product names and sizes
        const names = [
          ...new Set(response.data.map((product) => product.product_name)),
        ];
        const sizes = [
          ...new Set(response.data.map((product) => product.size)),
        ];

        setProductNames(names);
        setProductSizes(sizes);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchLorries();
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle loading item changes
  const handleLoadingItemChange = (index, field, value) => {
    const updatedItems = [...loadingItems];
    updatedItems[index][field] = value;

    // If product name or size changed, update the product_id
    if (field === "product_name" || field === "product_size") {
      const selectedName =
        field === "product_name" ? value : updatedItems[index].product_name;
      const selectedSize =
        field === "product_size" ? value : updatedItems[index].product_size;

      // Find matching product
      if (selectedName && selectedSize) {
        const matchingProduct = products.find(
          (p) => p.product_name === selectedName && p.size === selectedSize
        );

        if (matchingProduct) {
          updatedItems[index].product_id = matchingProduct.product_id;
        } else {
          updatedItems[index].product_id = "";
        }
      } else {
        updatedItems[index].product_id = "";
      }
    }

    setLoadingItems(updatedItems);
  };

  // Add another loading item
  const addLoadingItem = () => {
    setLoadingItems([
      ...loadingItems,
      {
        product_id: "",
        product_name: "",
        product_size: "",
        cases_loaded: 0,
        bottles_loaded: 0,
      },
    ]);
  };

  // Remove a loading item
  const removeLoadingItem = (index) => {
    if (loadingItems.length > 1) {
      const updatedItems = [...loadingItems];
      updatedItems.splice(index, 1);
      setLoadingItems(updatedItems);
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.lorry_id || !formData.loaded_by) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate loading items
    const invalidItems = loadingItems.filter(
      (item) =>
        !item.product_id || item.cases_loaded < 0 || item.bottles_loaded < 0
    );

    if (invalidItems.length > 0) {
      setError("Please fill in all product details with valid quantities");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare the request payload
      const loadingData = {
        ...formData,
        loadingDetails: loadingItems.map((item) => ({
          product_id: item.product_id,
          cases_loaded: parseInt(item.cases_loaded),
          bottles_loaded: parseInt(item.bottles_loaded),
        })),
      };

      // Send the loading transaction request
      await axios.post(`${API_URL}/loading-transactions`, loadingData);

      setSuccess(true);
      // Reset form
      setFormData({
        lorry_id: "",
        loading_date: new Date().toISOString().split("T")[0],
        loading_time: new Date().toTimeString().split(" ")[0],
        loaded_by: "",
        status: "Pending",
      });
      setLoadingItems([
        {
          product_id: "",
          product_name: "",
          product_size: "",
          cases_loaded: 0,
          bottles_loaded: 0,
        },
      ]);

      // Notify parent component
      if (onLoadingAdded) {
        onLoadingAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error creating loading transaction:", err);
      setError(
        err.response?.data?.message || "Failed to create loading transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Add New Loading</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Loading transaction created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Lorry Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Lorry*
            </label>
            <select
              name="lorry_id"
              value={formData.lorry_id}
              onChange={handleInputChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Lorry</option>
              {lorries.map((lorry) => (
                <option key={lorry.lorry_id} value={lorry.lorry_id}>
                  {lorry.lorry_number} - {lorry.driver_name}
                </option>
              ))}
            </select>
          </div>

          {/* Loaded By */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Loaded By*
            </label>
            <input
              type="text"
              name="loaded_by"
              value={formData.loaded_by}
              onChange={handleInputChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Loading Date */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Loading Date
            </label>
            <input
              type="date"
              name="loading_date"
              value={formData.loading_date}
              onChange={handleInputChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Loading Time */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Loading Time
            </label>
            <input
              type="time"
              name="loading_time"
              value={formData.loading_time}
              onChange={handleInputChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Products to Load</h3>

          {loadingItems.map((item, index) => (
            <div key={index} className="flex flex-wrap -mx-3 mb-4 items-end">
              {/* Product Name Selection */}
              <div className="px-3 w-full md:w-1/4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Product Name*
                </label>
                <select
                  value={item.product_name}
                  onChange={(e) =>
                    handleLoadingItemChange(
                      index,
                      "product_name",
                      e.target.value
                    )
                  }
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Product</option>
                  {productNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Size Selection */}
              <div className="px-3 w-full md:w-1/4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Product Size*
                </label>
                <select
                  value={item.product_size}
                  onChange={(e) =>
                    handleLoadingItemChange(
                      index,
                      "product_size",
                      e.target.value
                    )
                  }
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Size</option>
                  {productSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="px-3 w-1/2 md:w-1/6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Cases
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.cases_loaded}
                  onChange={(e) =>
                    handleLoadingItemChange(
                      index,
                      "cases_loaded",
                      e.target.value
                    )
                  }
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="px-3 w-1/2 md:w-1/6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Bottles
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.bottles_loaded}
                  onChange={(e) =>
                    handleLoadingItemChange(
                      index,
                      "bottles_loaded",
                      e.target.value
                    )
                  }
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="px-3 w-full md:w-1/6 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeLoadingItem(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loadingItems.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center">
            <div className="mt-4">
              <button
                type="button"
                onClick={addLoadingItem}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Product
              </button>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? "Processing..." : "Create Loading Transaction"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewLoadingForm;
