import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LoadingUnloadingHistory = () => {
  const [activeTab, setActiveTab] = useState("Loading");
  const [loadingTransactions, setLoadingTransactions] = useState([]);
  const [unloadingTransactions, setUnloadingTransactions] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch loading transactions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (activeTab === "Loading") {
          const response = await axios.get(`${API_URL}/loading-transactions`);
          setLoadingTransactions(response.data);
        } else {
          const response = await axios.get(`${API_URL}/unloading-transactions`);
          setUnloadingTransactions(response.data);
        }
      } catch (err) {
        console.error(
          `Failed to fetch ${activeTab.toLowerCase()} transactions:`,
          err
        );
        setError(`Failed to fetch ${activeTab.toLowerCase()} transactions`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Fetch transaction details when a transaction is selected
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!currentTransaction) return;

      try {
        setIsLoading(true);
        setError(null);

        let response;
        if (activeTab === "Loading") {
          response = await axios.get(
            `${API_URL}/loading-transactions/${currentTransaction.loading_id}/details`
          );
        } else {
          response = await axios.get(
            `${API_URL}/unloading-transactions/${currentTransaction.unloading_id}/details`
          );
        }

        setTransactionDetails(response.data);
      } catch (err) {
        console.error(
          `Failed to fetch ${activeTab.toLowerCase()} details:`,
          err
        );
        setError(`Failed to fetch ${activeTab.toLowerCase()} details`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [currentTransaction, activeTab]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle transaction selection
  const handleTransactionSelect = (transaction) => {
    setCurrentTransaction(transaction);
  };

  return (
    <div className="bg-white shadow-md rounded p-6">
      <h2 className="text-xl font-semibold mb-6">
        Loading & Unloading History
      </h2>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${
              activeTab === "Loading"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => {
              setActiveTab("Loading");
              setCurrentTransaction(null);
            }}
          >
            Loading History
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "Unloading"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => {
              setActiveTab("Unloading");
              setCurrentTransaction(null);
            }}
          >
            Unloading History
          </button>
        </div>
      </div>

      {isLoading && !currentTransaction ? (
        <div className="text-center py-4">Loading transactions...</div>
      ) : error && !currentTransaction ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Transaction List */}
          <div className="col-span-1 border rounded p-4">
            <h3 className="font-medium mb-4">{activeTab} Transactions</h3>

            {activeTab === "Loading" && loadingTransactions.length === 0 ? (
              <p className="text-gray-500">No loading transactions found.</p>
            ) : activeTab === "Unloading" &&
              unloadingTransactions.length === 0 ? (
              <p className="text-gray-500">No unloading transactions found.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {(activeTab === "Loading"
                    ? loadingTransactions
                    : unloadingTransactions
                  ).map((transaction) => {
                    const transactionId =
                      activeTab === "Loading"
                        ? transaction.loading_id
                        : transaction.unloading_id;
                    const transactionDate =
                      activeTab === "Loading"
                        ? transaction.loading_date
                        : transaction.unloading_date;
                    const isSelected =
                      currentTransaction &&
                      (activeTab === "Loading"
                        ? currentTransaction.loading_id ===
                          transaction.loading_id
                        : currentTransaction.unloading_id ===
                          transaction.unloading_id);

                    return (
                      <li
                        key={transactionId}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleTransactionSelect(transaction)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              {activeTab} #{transactionId}
                            </p>
                            <p className="text-sm text-gray-500">
                              Lorry ID: {transaction.lorry_id}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {formatDate(transactionDate)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Transaction Details */}
          <div className="col-span-1 md:col-span-2 border rounded p-4">
            <h3 className="font-medium mb-4">Transaction Details</h3>

            {!currentTransaction ? (
              <p className="text-gray-500">
                Select a transaction to view details.
              </p>
            ) : isLoading ? (
              <div className="text-center py-4">Loading details...</div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p>
                      {activeTab === "Loading"
                        ? currentTransaction.loading_id
                        : currentTransaction.unloading_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lorry ID</p>
                    <p>{currentTransaction.lorry_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p>
                      {formatDate(
                        activeTab === "Loading"
                          ? currentTransaction.loading_date
                          : currentTransaction.unloading_date
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p>
                      {activeTab === "Loading"
                        ? currentTransaction.loading_time
                        : currentTransaction.unloading_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {activeTab === "Loading" ? "Loaded By" : "Unloaded By"}
                    </p>
                    <p>
                      {activeTab === "Loading"
                        ? currentTransaction.loaded_by
                        : currentTransaction.unloaded_by}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p>{currentTransaction.status}</p>
                  </div>
                </div>

                <h4 className="font-medium mb-2">
                  Products {activeTab === "Loading" ? "Loaded" : "Returned"}
                </h4>

                {transactionDetails.length === 0 ? (
                  <p className="text-gray-500">
                    No details found for this transaction.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Product ID
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Cases
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Bottles
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Bottles
                          </th>
                          <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactionDetails.map((detail, index) => {
                          const cases =
                            activeTab === "Loading"
                              ? detail.cases_loaded
                              : detail.cases_returned;
                          const bottles =
                            activeTab === "Loading"
                              ? detail.bottles_loaded
                              : detail.bottles_returned;
                          const totalBottles =
                            activeTab === "Loading"
                              ? detail.total_bottles_loaded
                              : detail.total_bottles_returned;

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="py-2 px-3">{detail.product_id}</td>
                              <td className="py-2 px-3">{cases}</td>
                              <td className="py-2 px-3">{bottles}</td>
                              <td className="py-2 px-3">{totalBottles}</td>
                              <td className="py-2 px-3">
                                ${parseFloat(detail.value).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingUnloadingHistory;
