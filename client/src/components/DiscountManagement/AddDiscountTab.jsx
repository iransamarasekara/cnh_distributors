import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AddDiscountTab = ({ shops, lorries, onAddDiscount }) => {
  const [selectedLorry, setSelectedLorry] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [discountedCases, setDiscountedCases] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSubDiscountType, setSelectedSubDiscountType] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [maxDiscountedCases, setMaxDiscountedCases] = useState(0);
  const [products, setProducts] = useState([]);
  const [subDiscountTypes, setSubDiscountTypes] = useState([]);
  const [filteredSubDiscountTypes, setFilteredSubDiscountTypes] = useState([]);
  const [selectedShopType, setSelectedShopType] = useState("");

  // Reset form
  const resetForm = () => {
    setSelectedLorry("");
    setInvoiceNumber("");
    setDiscountedCases("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedShop("");
    setSelectedProduct("");
    setSelectedSubDiscountType("");
    setSelectedShopType("");
  };

  // Fetch products and sub discount types when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get(`${API_URL}/products`);
        setProducts(productsResponse.data);

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
      // For SSG shop type, show type-1 and type-2
      filtered = subDiscountTypes.filter(
        (type) =>
          type.sub_discount_type === "ALL WO MPET" ||
          type.sub_discount_type === "ALL MPET" ||
          type.sub_discount_type === "MPET (SSG)"
      );
    } else if (selectedShopType === "SPC") {
      // For SPC shop type, show type-3 and type-4
      filtered = subDiscountTypes.filter(
        (type) =>
          type.sub_discount_type === "RGB" ||
          type.sub_discount_type === "MPET (SPC)" ||
          type.sub_discount_type === "LPET"
      );
    }

    setFilteredSubDiscountTypes(filtered);
  }, [selectedShopType, subDiscountTypes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !selectedLorry ||
      !invoiceNumber ||
      !discountedCases ||
      !selectedDate ||
      !selectedTime ||
      !selectedShop ||
      !selectedProduct ||
      !selectedSubDiscountType
    ) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    const discountedCasesNum = parseInt(discountedCases, 10);

    if (discountedCasesNum <= 0) {
      setStatus({
        type: "error",
        message: "Discounted cases must be greater than zero.",
      });
      return;
    }

    if (discountedCasesNum > maxDiscountedCases) {
      setStatus({
        type: "error",
        message: `Discounted cases exceed maximum allowed (${maxDiscountedCases}).`,
      });
      return;
    }

    const discountData = {
      shop_id: selectedShop,
      lorry_id: selectedLorry,
      selling_date: `${selectedDate}T${selectedTime}`,
      sub_discount_type_id: selectedSubDiscountType,
      discounted_cases: discountedCasesNum,
      product_id: selectedProduct,
      invoice_number: invoiceNumber,
    };

    const result = await onAddDiscount(discountData);

    if (result.success) {
      setStatus({
        type: "success",
        message: "Discount added successfully!",
      });
      resetForm();
    } else {
      setStatus({
        type: "error",
        message: result.error || "Failed to add discount.",
      });
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

        {/* Product Selection */}
        <div className="mb-4">
          <label
            htmlFor="product"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Product
          </label>
          <select
            id="product"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.product_id} value={product.product_id}>
                {product.product_name} - {product.size}
              </option>
            ))}
          </select>
        </div>

        {/* Discount Type Selection */}
        <div className="mb-4">
          <label
            htmlFor="discountType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Discount Type
          </label>
          <select
            id="discountType"
            value={selectedSubDiscountType}
            onChange={(e) => setSelectedSubDiscountType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={!selectedShopType}
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
          {selectedShop && filteredSubDiscountTypes.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Please select a shop first to see available discount types
            </p>
          )}
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

        {/* Discounted Cases */}
        <div className="mb-6">
          <label
            htmlFor="cases"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Discounted Cases
          </label>
          <input
            type="number"
            id="cases"
            min="1"
            step="1"
            value={discountedCases}
            onChange={(e) => setDiscountedCases(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Discount
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDiscountTab;
