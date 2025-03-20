import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const InventoryHistory = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await axios.get(`${API_URL}/products`);
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch transactions when a product is selected
  useEffect(() => {
    if (!selectedProductId) return;

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_URL}/stock-inventory/history/${selectedProductId}`
        );
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch transaction history");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedProductId]);

  // Handle product selection for history view
  const handleProductSelect = (id) => {
    setSelectedProductId(id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_id?.toString().includes(searchTerm) ||
      product.size?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Product selection section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Select Product</h2>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by product name, ID or SIZE"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {isLoadingProducts ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-y-auto max-h-64 border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SIZE
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.product_id}
                    className={`hover:bg-gray-50 ${
                      selectedProductId === product.product_id
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
                      {product.product_id}
                    </td>
                    <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.product_name}
                    </td>
                    <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
                      {product.size || "-"}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleProductSelect(product.product_id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg p-8">
            <p className="text-gray-600">
              No products found matching your search
            </p>
          </div>
        )}
      </div>

      {/* Transaction history section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {!selectedProductId ? (
          <div className="text-center py-12">
            <svg
              className="h-12 w-12 text-gray-400 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Transaction History
            </h3>
            <p className="text-gray-600">
              Select a product above to view its transaction history
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transaction history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg mx-auto">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              <button
                className="mt-2 bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded"
                onClick={() => handleProductSelect(selectedProductId)} // Retry fetch
              >
                Retry
              </button>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="h-12 w-12 text-gray-400 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-600">
              {products.find((p) => p.product_id === selectedProductId)?.name ||
                "This product"}{" "}
              has no recorded transaction history
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-medium p-4 bg-gray-50 border-b">
              Transaction History:{" "}
              {products.find((p) => p.product_id === selectedProductId)?.name ||
                `Product #${selectedProductId}`}
            </h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cases
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bottles
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bottles
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.transaction_id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="px-6 py-1 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-1 font-medium rounded-full ${
                          transaction.transaction_type === "ADD"
                            ? "bg-green-100 text-green-800"
                            : transaction.transaction_type === "REMOVE"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      {transaction.cases_qty}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      {transaction.bottles_qty}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      {transaction.total_bottles}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      Rs.{" "}
                      {parseFloat(transaction.total_value).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                    <td className="px-6 py-2 text-sm text-gray-500 max-w-md truncate">
                      {transaction.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="7" className="px-6 py-2 text-sm text-gray-500">
                    {transactions.length} transaction
                    {transactions.length !== 1 ? "s" : ""} found
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistory;
