import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AddNewUnloadingForm = ({ onUnloadingAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lorries, setLorries] = useState([]);
  const [products, setProducts] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [productSizes, setProductSizes] = useState([]);
  const [unloadingItems, setUnloadingItems] = useState([
    {
      product_id: "",
      product_name: "",
      product_size: "",
      cases_returned: 0,
      bottles_returned: 0,
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    lorry_id: "",
    unloading_date: new Date().toISOString().split("T")[0],
    unloading_time: new Date().toTimeString().split(" ")[0],
    unloaded_by: "",
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
        const uniqueNames = [
          ...new Set(response.data.map((product) => product.product_name)),
        ];
        const uniqueSizes = [
          ...new Set(response.data.map((product) => product.size)),
        ];

        setProductNames(uniqueNames);
        setProductSizes(uniqueSizes);
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

  // Find product_id based on name and size
  const findProductId = (name, size) => {
    const product = products.find(
      (p) => p.product_name === name && p.size === size
    );
    return product ? product.product_id : "";
  };

  // Handle unloading item changes for product name and size
  const handleProductSelection = (index, field, value) => {
    const updatedItems = [...unloadingItems];
    updatedItems[index][field] = value;

    // If both name and size are selected, find the product_id
    if (field === "product_name" && updatedItems[index].product_size) {
      updatedItems[index].product_id = findProductId(
        value,
        updatedItems[index].product_size
      );
    } else if (field === "product_size" && updatedItems[index].product_name) {
      updatedItems[index].product_id = findProductId(
        updatedItems[index].product_name,
        value
      );
    }

    setUnloadingItems(updatedItems);
  };

  // Handle unloading item changes
  const handleUnloadingItemChange = (index, field, value) => {
    const updatedItems = [...unloadingItems];
    updatedItems[index][field] = value;
    setUnloadingItems(updatedItems);
  };

  // Add another unloading item
  const addUnloadingItem = () => {
    setUnloadingItems([
      ...unloadingItems,
      {
        product_id: "",
        product_name: "",
        product_size: "",
        cases_returned: 0,
        bottles_returned: 0,
      },
    ]);
  };

  // Remove an unloading item
  const removeUnloadingItem = (index) => {
    if (unloadingItems.length > 1) {
      const updatedItems = [...unloadingItems];
      updatedItems.splice(index, 1);
      setUnloadingItems(updatedItems);
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.lorry_id || !formData.unloaded_by) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate unloading items
    const invalidItems = unloadingItems.filter(
      (item) =>
        !item.product_id || item.cases_returned < 0 || item.bottles_returned < 0
    );

    if (invalidItems.length > 0) {
      setError("Please fill in all product details with valid quantities");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare the request payload
      const unloadingData = {
        ...formData,
        unloadingDetails: unloadingItems.map((item) => ({
          product_id: item.product_id,
          cases_returned: parseInt(item.cases_returned),
          bottles_returned: parseInt(item.bottles_returned),
        })),
      };

      // Send the unloading transaction request
      await axios.post(`${API_URL}/unloading-transactions`, unloadingData);

      setSuccess(true);
      // Reset form
      setFormData({
        lorry_id: "",
        unloading_date: new Date().toISOString().split("T")[0],
        unloading_time: new Date().toTimeString().split(" ")[0],
        unloaded_by: "",
        status: "Pending",
      });
      setUnloadingItems([
        {
          product_id: "",
          product_name: "",
          product_size: "",
          cases_returned: 0,
          bottles_returned: 0,
        },
      ]);

      // Notify parent component
      if (onUnloadingAdded) {
        onUnloadingAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error creating unloading transaction:", err);
      setError(
        err.response?.data?.message || "Failed to create unloading transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Add New Unloading</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Unloading transaction created successfully!
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

          {/* Unloaded By */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Unloaded By*
            </label>
            <input
              type="text"
              name="unloaded_by"
              value={formData.unloaded_by}
              onChange={handleInputChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {/* Unloading Date */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Unloading Date
            </label>
            <input
              type="date"
              name="unloading_date"
              value={formData.unloading_date}
              onChange={handleInputChange}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Unloading Time */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Unloading Time
            </label>
            <input
              type="time"
              name="unloading_time"
              value={formData.unloading_time}
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

        {/* Unloading Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Returned Products</h3>

          {unloadingItems.map((item, index) => (
            <div key={index} className="flex flex-wrap -mx-3 mb-4 items-end">
              <div className="px-3 w-full md:w-1/4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Product Name*
                </label>
                <select
                  value={item.product_name}
                  onChange={(e) =>
                    handleProductSelection(
                      index,
                      "product_name",
                      e.target.value
                    )
                  }
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Product Name</option>
                  {productNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="px-3 w-full md:w-1/4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Product Size*
                </label>
                <select
                  value={item.product_size}
                  onChange={(e) =>
                    handleProductSelection(
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
                  Cases Returned
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.cases_returned}
                  onChange={(e) =>
                    handleUnloadingItemChange(
                      index,
                      "cases_returned",
                      e.target.value
                    )
                  }
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="px-3 w-1/2 md:w-1/6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Bottles Returned
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.bottles_returned}
                  onChange={(e) =>
                    handleUnloadingItemChange(
                      index,
                      "bottles_returned",
                      e.target.value
                    )
                  }
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="px-3 w-full md:w-1/6 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeUnloadingItem(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={unloadingItems.length === 1}
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
                onClick={addUnloadingItem}
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
                {loading ? "Processing..." : "Create Unloading Transaction"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewUnloadingForm;
