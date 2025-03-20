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
  const [lastLoadingData, setLastLoadingData] = useState(null);
  const [loadingDataLoading, setLoadingDataLoading] = useState(false);
  const [noActiveLoading, setNoActiveLoading] = useState(false);
  const [unloadingItems, setUnloadingItems] = useState([
    {
      product_id: "",
      product_name: "",
      product_size: "",
      cases_returned: 0,
      bottles_returned: 0,
      cases_loaded: 0,
      bottles_loaded: 0,
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    lorry_id: "",
    unloading_date: new Date().toISOString().split("T")[0],
    unloading_time: new Date().toTimeString().split(" ")[0],
    unloaded_by: "",
    status: "Completed",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedLorry, setSelectedLorry] = useState(null);

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

  // Fetch last loading data when lorry is selected
  useEffect(() => {
    if (formData.lorry_id) {
      fetchLastLoadingData(formData.lorry_id);
    } else {
      setLastLoadingData(null);
      setNoActiveLoading(false);
    }
  }, [formData.lorry_id]);

  // Fetch last loading transaction for the selected lorry
  const fetchLastLoadingData = async (lorryId) => {
    try {
      setLoadingDataLoading(true);
      setNoActiveLoading(false);
      const response = await axios.get(`${API_URL}/loading-transactions`, {
        params: {
          lorryId: lorryId,
          limit: 1,
        },
      });

      if (response.data && response.data.length > 0) {
        setLastLoadingData(response.data[0]);

        // Check if the last loading transaction is already unloaded
        if (response.data[0].status === "Unloaded") {
          setNoActiveLoading(true);
          // Reset unloading items
          setUnloadingItems([
            {
              product_id: "",
              product_name: "",
              product_size: "",
              cases_returned: 0,
              bottles_returned: 0,
              cases_loaded: 0,
              bottles_loaded: 0,
            },
          ]);
        } else {
          // Populate unloading items with last loading data
          if (
            response.data[0].loadingDetails &&
            response.data[0].loadingDetails.length > 0
          ) {
            const loadedItems = response.data[0].loadingDetails.map(
              (detail) => ({
                product_id: detail.product.product_id,
                product_name: detail.product.product_name,
                product_size: detail.product.size,
                cases_returned: 0,
                bottles_returned: 0,
                cases_loaded: detail.cases_loaded,
                bottles_loaded: detail.bottles_loaded,
              })
            );

            setUnloadingItems(loadedItems);
          }
        }
      } else {
        setNoActiveLoading(true);
      }
    } catch (err) {
      console.error("Failed to fetch last loading data:", err);
      setError("Failed to fetch loading data for this lorry");
    } finally {
      setLoadingDataLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation checks (keep your existing validation logic)
    if (noActiveLoading) {
      setError("There are no active loading transactions to unload");
      return;
    }

    if (!formData.lorry_id || !formData.unloaded_by) {
      setError("Please fill in all required fields");
      return;
    }

    const invalidItems = unloadingItems.filter(
      (item) =>
        !item.product_id || item.cases_returned < 0 || item.bottles_returned < 0
    );

    if (invalidItems.length > 0) {
      setError("Please fill in all product details with valid quantities");
      return;
    }

    // Find the selected lorry details
    const lorry = lorries.find(
      (l) => l.lorry_id === parseInt(formData.lorry_id)
    );
    setSelectedLorry(lorry);

    // Show confirmation modal instead of submitting directly
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleSubmitConfirmed = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare the request payload
      const unloadingData = {
        ...formData,
        unloadingDetails: unloadingItems
          .filter((item) => item.product_id)
          .map((item) => ({
            product_id: item.product_id,
            cases_returned: parseInt(item.cases_returned),
            bottles_returned: parseInt(item.bottles_returned),
          })),
      };

      // Send the unloading transaction request
      await axios.post(`${API_URL}/unloading-transactions`, unloadingData);

      setSuccess(true);
      setShowConfirmation(false);

      // Reset form (keep your existing reset logic)
      setFormData({
        lorry_id: "",
        unloading_date: new Date().toISOString().split("T")[0],
        unloading_time: new Date().toTimeString().split(" ")[0],
        unloaded_by: "",
        status: "Completed",
      });

      setUnloadingItems([
        {
          product_id: "",
          product_name: "",
          product_size: "",
          cases_returned: 0,
          bottles_returned: 0,
          cases_loaded: 0,
          bottles_loaded: 0,
        },
      ]);

      setLastLoadingData(null);
      setNoActiveLoading(false);

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
        cases_loaded: 0,
        bottles_loaded: 0,
      },
    ]);
  };

  // Remove an unloading item
  // const removeUnloadingItem = (index) => {
  //   if (unloadingItems.length > 1) {
  //     const updatedItems = [...unloadingItems];
  //     updatedItems.splice(index, 1);
  //     setUnloadingItems(updatedItems);
  //   }
  // };

  // Submit the form
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Check if there's an active loading to unload
  //   if (noActiveLoading) {
  //     setError("There are no active loading transactions to unload");
  //     return;
  //   }

  //   // Validate form data
  //   if (!formData.lorry_id || !formData.unloaded_by) {
  //     setError("Please fill in all required fields");
  //     return;
  //   }

  //   // Validate unloading items
  //   const invalidItems = unloadingItems.filter(
  //     (item) =>
  //       !item.product_id || item.cases_returned < 0 || item.bottles_returned < 0
  //   );

  //   if (invalidItems.length > 0) {
  //     setError("Please fill in all product details with valid quantities");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError(null);

  //     // Prepare the request payload
  //     const unloadingData = {
  //       ...formData,
  //       unloadingDetails: unloadingItems.map((item) => ({
  //         product_id: item.product_id,
  //         cases_returned: parseInt(item.cases_returned),
  //         bottles_returned: parseInt(item.bottles_returned),
  //       })),
  //     };

  //     // Send the unloading transaction request
  //     await axios.post(`${API_URL}/unloading-transactions`, unloadingData);

  //     setSuccess(true);
  //     // Reset form
  //     setFormData({
  //       lorry_id: "",
  //       unloading_date: new Date().toISOString().split("T")[0],
  //       unloading_time: new Date().toTimeString().split(" ")[0],
  //       unloaded_by: "",
  //       status: "Completed",
  //     });
  //     setUnloadingItems([
  //       {
  //         product_id: "",
  //         product_name: "",
  //         product_size: "",
  //         cases_returned: 0,
  //         bottles_returned: 0,
  //         cases_loaded: 0,
  //         bottles_loaded: 0,
  //       },
  //     ]);
  //     setLastLoadingData(null);
  //     setNoActiveLoading(false);

  //     // Notify parent component
  //     if (onUnloadingAdded) {
  //       onUnloadingAdded();
  //     }

  //     // Clear success message after 3 seconds
  //     setTimeout(() => {
  //       setSuccess(false);
  //     }, 3000);
  //   } catch (err) {
  //     console.error("Error creating unloading transaction:", err);
  //     setError(
  //       err.response?.data?.message || "Failed to create unloading transaction"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Confirm Unloading Transaction
            </h3>

            <div className="mb-4">
              <p className="font-semibold">Lorry Details:</p>
              <p>
                Lorry:{" "}
                {selectedLorry
                  ? `${selectedLorry.lorry_number} - ${selectedLorry.driver_name}`
                  : "no data"}
              </p>
              <p>Unloaded By: {formData.unloaded_by}</p>
              <p>Date: {formData.unloading_date}</p>
              <p>Time: {formData.unloading_time}</p>
            </div>

            <div className="mb-4">
              <p className="font-semibold mb-2">Products Returned:</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border text-left">Product</th>
                      <th className="py-2 px-4 border text-left">Size</th>
                      <th className="py-2 px-4 border text-center">
                        Cases Loaded
                      </th>
                      <th className="py-2 px-4 border text-center">
                        Bottles Loaded
                      </th>
                      <th className="py-2 px-4 border text-center">
                        Cases Returned
                      </th>
                      <th className="py-2 px-4 border text-center">
                        Bottles Returned
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unloadingItems
                      .filter((item) => item.product_id)
                      .map((item) => (
                        <tr key={item.product_id}>
                          <td className="py-1 px-4 border">
                            {item.product_name}
                          </td>
                          <td className="py-1 px-4 border">
                            {item.product_size}
                          </td>
                          <td className="py-1 px-4 border text-center">
                            {item.cases_loaded}
                          </td>
                          <td className="py-1 px-4 border text-center">
                            {item.bottles_loaded}
                          </td>
                          <td className="py-1 px-4 border text-center">
                            {item.cases_returned}
                          </td>
                          <td className="py-1 px-4 border text-center">
                            {item.bottles_returned}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelConfirmation}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitConfirmed}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
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
              disabled={noActiveLoading}
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
              disabled={noActiveLoading}
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
              disabled={noActiveLoading}
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
              disabled
            >
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Loading Data Information */}
        {loadingDataLoading && (
          <div className="mb-6">
            <p className="text-gray-700">Loading recent loading data...</p>
          </div>
        )}

        {/* No active loading transaction message */}
        {noActiveLoading && (
          <div className="mb-6 bg-yellow-50 p-4 rounded border border-yellow-200">
            <h3 className="text-lg font-medium mb-2 text-yellow-700">
              No Active Loading Transaction
            </h3>
            <p className="text-gray-700">
              There are no active loading transactions to unload for this lorry.
              The last loading transaction has already been unloaded or no
              loading transaction exists for this lorry.
            </p>
          </div>
        )}

        {lastLoadingData && !noActiveLoading && (
          <div className="mb-6 bg-blue-50 p-4 rounded border border-blue-200">
            <h3 className="text-lg font-medium mb-2 text-blue-700">
              Last Loading Information
            </h3>
            <p className="text-gray-700">
              Loaded on:{" "}
              {new Date(lastLoadingData.loading_date).toLocaleDateString()} at{" "}
              {lastLoadingData.loading_time}
            </p>
            <p className="text-gray-700">
              Loaded by: {lastLoadingData.loaded_by}
            </p>
            <p className="text-gray-700">
              Total: {lastLoadingData.totalCases} cases,{" "}
              {lastLoadingData.totalBottles} bottles
            </p>
          </div>
        )}

        {/* Unloading Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Returned Products</h3>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Returned Products</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-2 border-white text-left">
                      Size
                    </th>
                    <th className="py-2 px-4 border-2 border-white text-left">
                      Product Name
                    </th>
                    <th className="py-2 px-4 border-2 border-white text-center">
                      Cases Loaded
                    </th>
                    <th className="py-2 px-4 border-2 border-white text-center">
                      Bottles Loaded
                    </th>
                    <th className="py-2 px-4 border-2 border-white text-center">
                      Cases Returned
                    </th>
                    <th className="py-2 px-4 border-2 border-white text-center">
                      Bottles Returned
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unloadingItems.length > 0 ? (
                    unloadingItems.map((item, index) => (
                      <tr
                        key={index}
                        className={item.validationError ? "bg-red-100" : ""}
                      >
                        <td className="py-1 px-4 border-2 border-white">
                          <select
                            value={item.product_size}
                            onChange={(e) =>
                              handleProductSelection(
                                index,
                                "product_size",
                                e.target.value
                              )
                            }
                            className="shadow appearance-none border border-gray-300 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                            disabled={noActiveLoading}
                          >
                            <option value="">Select Size</option>
                            {productSizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1 px-4 border-2 border-white">
                          <select
                            value={item.product_name}
                            onChange={(e) =>
                              handleProductSelection(
                                index,
                                "product_name",
                                e.target.value
                              )
                            }
                            className="shadow appearance-none border border-gray-300 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                            disabled={noActiveLoading}
                          >
                            <option value="">Select Product</option>
                            {productNames.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1 px-4 border-2 border-white text-center">
                          <input
                            type="number"
                            value={item.cases_loaded || 0}
                            className="shadow appearance-none border border-gray-200 bg-gray-100 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled
                          />
                        </td>
                        <td className="py-1 px-4 border-2 border-white text-center">
                          <input
                            type="number"
                            value={item.bottles_loaded || 0}
                            className="shadow appearance-none border border-gray-200 bg-gray-100 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled
                          />
                        </td>
                        <td className="py-1 px-4 border-2 border-white">
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
                            className="shadow appearance-none border border-gray-300 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={noActiveLoading}
                          />
                        </td>
                        <td className="py-1 px-4 border-2 border-white">
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
                            className="shadow appearance-none border border-gray-300 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={noActiveLoading}
                          />
                          {item.validationError && (
                            <p className="text-red-500 text-xs mt-1">
                              {item.validationError}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-4 text-center text-gray-500"
                      >
                        No products available for unloading.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={addUnloadingItem}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={noActiveLoading}
              >
                Add Product
              </button>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading || noActiveLoading}
              >
                {loading ? "Processing..." : "Review Unloading Transaction"}
              </button>
            </div>
          </div>
          {/* <div className="flex justify-between items-center">
            <div className="mt-4">
              <button
                type="button"
                onClick={addUnloadingItem}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={noActiveLoading}
              >
                Add Product
              </button>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading || noActiveLoading}
              >
                {loading ? "Processing..." : "Create Unloading Transaction"}
              </button>
            </div>
          </div> */}
        </div>
      </form>
    </div>
  );
};

export default AddNewUnloadingForm;
