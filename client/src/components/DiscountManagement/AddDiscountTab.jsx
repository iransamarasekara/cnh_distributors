import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AddDiscountTab = ({ shops, lorries, onAddDiscount }) => {
  const [selectedLorry, setSelectedLorry] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedSubDiscountType, setSelectedSubDiscountType] = useState("");
  const [currentCases, setCurrentCases] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [maxDiscountedCases, setMaxDiscountedCases] = useState(0);
  const [subDiscountTypes, setSubDiscountTypes] = useState([]);
  const [filteredSubDiscountTypes, setFilteredSubDiscountTypes] = useState([]);
  const [selectedShopType, setSelectedShopType] = useState("");
  const [addedDiscounts, setAddedDiscounts] = useState([]);
  const [totalDiscountedCases, setTotalDiscountedCases] = useState(0);

  // Reset form
  const resetForm = () => {
    setSelectedLorry("");
    setInvoiceNumber("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedShop("");
    setSelectedSubDiscountType("");
    setCurrentCases("");
    setSelectedShopType("");
    setAddedDiscounts([]);
    setTotalDiscountedCases(0);
  };

  // Fetch sub discount types when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const discountTypesResponse = await axios.get(
          `${API_URL}/sub-discount-types`
        );
        setSubDiscountTypes(discountTypesResponse.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  // When shop selection changes, fetch the max discounted cases and set shop type
  useEffect(() => {
    if (!selectedShop) {
      setMaxDiscountedCases(0);
      setSelectedShopType("");
      setFilteredSubDiscountTypes([]);
      setAddedDiscounts([]);
      setTotalDiscountedCases(0);
      return;
    }

    const getShopDetails = async () => {
      try {
        const shopResponse = await axios.get(
          `${API_URL}/shops/${selectedShop}`
        );
        if (shopResponse.data) {
          const shopData = shopResponse.data;
          setMaxDiscountedCases(shopData.max_discounted_cases || 0);
          setSelectedShopType(shopData.discount_type);

          // Reset selected sub discount type when shop changes
          setSelectedSubDiscountType("");
          setAddedDiscounts([]);
          setTotalDiscountedCases(0);
        }
      } catch (err) {
        console.error("Failed to fetch shop details:", err);
      }
    };

    getShopDetails();
  }, [selectedShop]);

  // Filter sub discount types based on shop type
  useEffect(() => {
    if (!selectedShopType || subDiscountTypes.length === 0) {
      setFilteredSubDiscountTypes([]);
      return;
    }

    let filtered = [];
    if (selectedShopType === "SSG") {
      // For SSG shop type, show specific types
      filtered = subDiscountTypes.filter(
        (type) =>
          type.sub_discount_type === "ALL WO MPET" ||
          type.sub_discount_type === "ALL MPET" ||
          type.sub_discount_type === "MPET (SSG)"
      );
    } else if (selectedShopType === "SPC") {
      // For SPC shop type, show specific types
      filtered = subDiscountTypes.filter(
        (type) =>
          type.sub_discount_type === "RGB" ||
          type.sub_discount_type === "MPET (SPC)" ||
          type.sub_discount_type === "LPET"
      );
    }

    setFilteredSubDiscountTypes(filtered);
  }, [selectedShopType, subDiscountTypes]);

  // Add current discount type and cases to the list
  const addDiscountItem = () => {
    // Validation
    if (!selectedSubDiscountType || !currentCases) {
      setStatus({
        type: "error",
        message: "Please select a discount type and enter cases",
      });
      return;
    }

    const casesNum = parseInt(currentCases, 10);
    if (casesNum <= 0) {
      setStatus({
        type: "error",
        message: "Cases must be greater than zero",
      });
      return;
    }

    // Check if adding these cases exceeds the maximum
    const newTotalCases = totalDiscountedCases + casesNum;
    if (newTotalCases > maxDiscountedCases) {
      setStatus({
        type: "error",
        message: `Adding ${casesNum} cases would exceed maximum allowed (${maxDiscountedCases})`,
      });
      return;
    }

    // Find the selected discount type details
    const discountType = subDiscountTypes.find(
      (type) => type.sub_discount_type_id === selectedSubDiscountType
    );

    if (!discountType) {
      setStatus({
        type: "error",
        message: "Selected discount type not found",
      });
      return;
    }

    // Check if this discount type is already added
    const existingIndex = addedDiscounts.findIndex(
      (item) => item.sub_discount_type_id === selectedSubDiscountType
    );

    if (existingIndex >= 0) {
      // Update existing entry
      const updatedDiscounts = [...addedDiscounts];
      updatedDiscounts[existingIndex].discounted_cases = casesNum;
      setAddedDiscounts(updatedDiscounts);
      
      // Recalculate total cases
      const newTotal = updatedDiscounts.reduce(
        (sum, item) => sum + item.discounted_cases,
        0
      );
      setTotalDiscountedCases(newTotal);
    } else {
      // Add new entry
      const newDiscount = {
        sub_discount_type_id: selectedSubDiscountType,
        sub_discount_type: discountType.sub_discount_type,
        discount_amount: discountType.discount_amount,
        discounted_cases: casesNum,
      };

      setAddedDiscounts([...addedDiscounts, newDiscount]);
      setTotalDiscountedCases(newTotalCases);
    }

    // Clear the inputs for next entry
    setSelectedSubDiscountType("");
    setCurrentCases("");
    setStatus({ type: "", message: "" });
  };

  // Remove a discount item
  const removeDiscountItem = (index) => {
    const updatedDiscounts = [...addedDiscounts];
    const removedCases = updatedDiscounts[index].discounted_cases;
    updatedDiscounts.splice(index, 1);
    
    setAddedDiscounts(updatedDiscounts);
    setTotalDiscountedCases(totalDiscountedCases - removedCases);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !selectedLorry ||
      !invoiceNumber ||
      !selectedDate ||
      !selectedTime ||
      !selectedShop ||
      addedDiscounts.length === 0
    ) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields and add at least one discount",
      });
      return;
    }

    // Prepare an array of discount data objects
    const discountDataArray = addedDiscounts.map(discount => ({
      shop_id: selectedShop,
      lorry_id: selectedLorry,
      selling_date: `${selectedDate}T${selectedTime}`,
      sub_discount_type_id: discount.sub_discount_type_id,
      discounted_cases: discount.discounted_cases,
      invoice_number: invoiceNumber,
    }));

    try {
      // Call the provided onAddDiscount function for each discount item
      for (const discountData of discountDataArray) {
        const result = await onAddDiscount(discountData);
        if (!result.success) {
          setStatus({
            type: "error",
            message: result.error || "Failed to add some discounts",
          });
          return;
        }
      }

      setStatus({
        type: "success",
        message: "All discounts added successfully!",
      });
      resetForm();
    } catch (error) {
      setStatus({
        type: "error",
        message: "An error occurred while adding discounts",
      });
      console.error("Error submitting discounts:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Add New Discount</h2>

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
              <option key={shop.shop_id} value={shop.shop_id}>
                {shop.shop_name} ({shop.discount_type})
              </option>
            ))}
          </select>
        </div>

        {selectedShop && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="text-sm">
              <div className="flex justify-between">
                <span>Maximum Discounted Cases:</span>
                <span className="font-medium">{maxDiscountedCases}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Total Cases Added:</span>
                <span className="font-medium">{totalDiscountedCases}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Cases Remaining:</span>
                <span className="font-medium">{maxDiscountedCases - totalDiscountedCases}</span>
              </div>
              {selectedShopType && (
                <div className="flex justify-between mt-1">
                  <span>Discount Type:</span>
                  <span className="font-medium">{selectedShopType}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lorry Selection */}
        <div className="mb-4">
          <label
            htmlFor="lorry"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Lorry
          </label>
          <select
            id="lorry"
            value={selectedLorry}
            onChange={(e) => setSelectedLorry(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a lorry</option>
            {lorries.map((lorry) => (
              <option key={lorry.lorry_id} value={lorry.lorry_id}>
                {lorry.lorry_number} - {lorry.driver_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Selling Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time
            </label>
            <input
              type="time"
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Invoice Number */}
        <div className="mb-4">
          <label
            htmlFor="invoice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Invoice Number
          </label>
          <input
            type="text"
            id="invoice"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Discount Type and Cases Selection */}
        {selectedShopType && (
          <div className="mb-4 border border-gray-200 rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Add Discount Items</h3>
            <div className="flex gap-3 mb-3">
              <div className="flex-grow">
                <label
                  htmlFor="discountType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Discount Type
                </label>
                <select
                  id="discountType"
                  value={selectedSubDiscountType}
                  onChange={(e) => setSelectedSubDiscountType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a discount type</option>
                  {filteredSubDiscountTypes.map((type) => (
                    <option
                      key={type.sub_discount_type_id}
                      value={type.sub_discount_type_id}
                    >
                      {type.sub_discount_type} (LKR {type.discount_amount} per case)
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label
                  htmlFor="cases"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cases
                </label>
                <input
                  type="number"
                  id="cases"
                  min="1"
                  step="1"
                  value={currentCases}
                  onChange={(e) => setCurrentCases(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="self-end mb-1">
                <button
                  type="button"
                  onClick={addDiscountItem}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Added Discount Items */}
            {addedDiscounts.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Added Discount Items:</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Discount Type
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Cases
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {addedDiscounts.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.sub_discount_type}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            LKR {item.discount_amount}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {item.discounted_cases}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            LKR {item.discount_amount * item.discounted_cases}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeDiscountItem(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium" colSpan="2">
                          Total
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-right">
                          {totalDiscountedCases}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-right">
                          LKR {addedDiscounts.reduce(
                            (sum, item) => sum + (item.discount_amount * item.discounted_cases),
                            0
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={addedDiscounts.length === 0}
          >
            Add Discount
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDiscountTab;