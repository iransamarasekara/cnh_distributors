import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SummeryOverview = ({ dateRange }) => {
  const [products, setProducts] = useState([]);
  const [lorryData, setLorryData] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState([]);
  const [unloadingTransactions, setUnloadingTransactions] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all necessary data when component mounts or date range changes
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Prepare date params
        const params = {
          startDate: dateRange?.startDate?.toISOString().split("T")[0],
          endDate: dateRange?.endDate?.toISOString().split("T")[0],
        };

        // Fetch all data in parallel
        const [
          productsRes,
          lorriesRes,
          loadingRes,
          unloadingRes,
          salesRes,
          stockRes,
        ] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/lorries`),
          axios.get(`${API_URL}/loading-transactions`, { params }),
          axios.get(`${API_URL}/unloading-transactions`, { params }),
          axios.get(`${API_URL}/daily-sales`, { params }),
          axios.get(`${API_URL}/stock-inventory`),
        ]);

        setProducts(productsRes.data);
        setLorryData(lorriesRes.data);
        setLoadingTransactions(loadingRes.data);
        setUnloadingTransactions(unloadingRes.data);
        setSalesData(salesRes.data);
        setStockData(stockRes.data);
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [dateRange]);

  // Process all data into a consolidated report
  const processConsolidatedData = () => {
    if (!products.length) return [];

    // Create a map to hold consolidated data for each product
    const productMap = new Map();

    // Initialize with product information
    products.forEach((product) => {
      productMap.set(product.product_id, {
        // Product Details
        product_id: product.product_id,
        product_name: product.product_name,
        size: product.size || "Standard",
        case_of_bottle: product.bottles_per_case || 0,
        unit_price: product.unit_price || 0,
        selling_price: product.selling_price || 0,

        // Price Details
        profit_margin:
          product.selling_price && product.unit_price
            ? (
                ((product.selling_price - product.unit_price) /
                  product.unit_price) *
                100
              ).toFixed(2)
            : 0,
        case_price: product.unit_price * (product.bottles_per_case || 0),

        // Initialize lorry data (will be populated)
        lorry_data: {},

        // Initialize current stock (will be updated)
        current_stock_case: 0,
        current_stock_bottles: 0,

        // Initialize sales data (will be updated)
        total_bottles: 0,
        total_value: 0,
        no_of_sale_units: 0,
        sale_income: 0,
        gross_profit: 0,
      });
    });

    // Process lorry data
    const lorryIds = lorryData.map((lorry) => lorry.lorry_id);

    // Initialize lorry data structure for each product
    productMap.forEach((productData, productId) => {
      lorryIds.forEach((lorryId) => {
        const lorryNumber =
          lorryData.find((l) => l.lorry_id === lorryId)?.lorry_number ||
          `Lorry ${lorryId}`;

        productData.lorry_data[lorryId] = {
          lorry_number: lorryNumber,
          cases_loaded: 0,
          bottles_loaded: 0,
          cases_returned: 0,
          bottles_returned: 0,
        };
      });
    });

    // Process loading transactions
    loadingTransactions.forEach((transaction) => {
      if (transaction.loadingDetails && transaction.loadingDetails.length > 0) {
        transaction.loadingDetails.forEach((detail) => {
          const productId = detail.product_id;
          const lorryId = transaction.lorry_id;

          if (productMap.has(productId) && lorryId) {
            const productData = productMap.get(productId);

            if (productData.lorry_data[lorryId]) {
              productData.lorry_data[lorryId].cases_loaded +=
                detail.cases_loaded || 0;
              productData.lorry_data[lorryId].bottles_loaded +=
                detail.bottles_loaded || 0;
            }
          }
        });
      }
    });

    // Process unloading transactions
    unloadingTransactions.forEach((transaction) => {
      if (
        transaction.unloadingDetails &&
        transaction.unloadingDetails.length > 0
      ) {
        transaction.unloadingDetails.forEach((detail) => {
          const productId = detail.product_id;
          const lorryId = transaction.lorry_id;

          if (productMap.has(productId) && lorryId) {
            const productData = productMap.get(productId);

            if (productData.lorry_data[lorryId]) {
              productData.lorry_data[lorryId].cases_returned +=
                detail.cases_returned || 0;
              productData.lorry_data[lorryId].bottles_returned +=
                detail.bottles_returned || 0;
            }
          }
        });
      }
    });

    // Process stock data
    stockData.forEach((stockItem) => {
      const productId = stockItem.product_id;

      if (productMap.has(productId)) {
        const productData = productMap.get(productId);
        productData.current_stock_case = stockItem.cases_qty || 0;
        productData.current_stock_bottles = stockItem.bottles_qty || 0;
        productData.total_bottles = stockItem.total_bottles || 0;
        productData.total_value = stockItem.total_value || 0;
      }
    });

    // Process sales data
    salesData.forEach((saleItem) => {
      const productId = saleItem.product_id;

      if (productMap.has(productId)) {
        const productData = productMap.get(productId);
        productData.no_of_sale_units =
          (productData.no_of_sale_units || 0) + (saleItem.units_sold || 0);
        productData.sale_income =
          (productData.sale_income || 0) + (saleItem.sales_income || 0);
        productData.gross_profit =
          (productData.gross_profit || 0) + (saleItem.gross_profit || 0);
      }
    });

    return Array.from(productMap.values());
  };

  const consolidatedData = processConsolidatedData();

  // Get unique lorry IDs from lorry data
  const lorryIds = lorryData.map((lorry) => lorry.lorry_id);

  // Format number as currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading inventory data...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-bold mb-4">Consolidated Inventory Report</h2>
      <p className="mb-4 text-gray-600">
        Period: {dateRange?.startDate?.toLocaleDateString() || "All time"} to{" "}
        {dateRange?.endDate?.toLocaleDateString() || "Present"}
      </p>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {/* Product Details - Header */}
              <th
                colSpan="3"
                className="px-2 py-2 bg-yellow-100 text-center text-xs font-medium text-gray-700 uppercase"
              >
                Product Details
              </th>

              {/* Price Details - Header */}
              <th
                colSpan="3"
                className="px-2 py-2 bg-blue-100 text-center text-xs font-medium text-gray-700 uppercase"
              >
                Price Details
              </th>

              {/* Lorry Data - Headers */}
              {lorryIds.map((lorryId) => (
                <React.Fragment key={`lorry-header-${lorryId}`}>
                  <th
                    colSpan="2"
                    className="px-2 py-2 bg-orange-200 text-center text-xs font-medium text-gray-700 uppercase"
                  >
                    {lorryData.find((l) => l.lorry_id === lorryId)
                      ?.lorry_number || `Lorry ${lorryId}`}{" "}
                    Loading
                  </th>
                  <th
                    colSpan="2"
                    className="px-2 py-2 bg-orange-100 text-center text-xs font-medium text-gray-700 uppercase"
                  >
                    {lorryData.find((l) => l.lorry_id === lorryId)
                      ?.lorry_number || `Lorry ${lorryId}`}{" "}
                    Unloading
                  </th>
                </React.Fragment>
              ))}

              {/* Current Stock - Header */}
              <th
                colSpan="2"
                className="px-2 py-2 bg-blue-200 text-center text-xs font-medium text-gray-700 uppercase"
              >
                Current Stock
              </th>

              {/* Financial Info - Header */}
              <th
                colSpan="4"
                className="px-2 py-2 bg-green-100 text-center text-xs font-medium text-gray-700 uppercase"
              >
                Financial Info
              </th>
            </tr>

            <tr className="bg-gray-50">
              {/* Product Details - Subheaders */}
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Size
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Brand
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Case of Bottles
              </th>

              {/* Price Details - Subheaders */}
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Unit Price
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Selling Price
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Profit Margin
              </th>

              {/* Lorry Data - Subheaders */}
              {lorryIds.map((lorryId) => (
                <React.Fragment key={`lorry-subheader-${lorryId}`}>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Case
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Bottles
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Case
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Bottles
                  </th>
                </React.Fragment>
              ))}

              {/* Current Stock - Subheaders */}
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Case
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Bottles
              </th>

              {/* Financial Info - Subheaders */}
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Total Bottles
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Total Value
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                No of Sale Units
              </th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Sale Income
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {consolidatedData.length > 0 ? (
              consolidatedData.map((item, index) => (
                <tr
                  key={item.product_id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {/* Product Details */}
                  <td className="px-2 py-2 text-sm text-gray-900">
                    {item.size}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900">
                    {item.product_name}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {item.case_of_bottle}
                  </td>

                  {/* Price Details */}
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {formatCurrency(item.selling_price)}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {item.profit_margin}%
                  </td>

                  {/* Lorry Data */}
                  {lorryIds.map((lorryId) => {
                    const lorryInfo = item.lorry_data[lorryId] || {
                      cases_loaded: 0,
                      bottles_loaded: 0,
                      cases_returned: 0,
                      bottles_returned: 0,
                    };

                    return (
                      <React.Fragment
                        key={`lorry-data-${lorryId}-${item.product_id}`}
                      >
                        <td className="px-2 py-2 text-sm text-blue-600 font-medium text-center">
                          {lorryInfo.cases_loaded}
                        </td>
                        <td className="px-2 py-2 text-sm text-blue-600 font-medium text-center">
                          {lorryInfo.bottles_loaded}
                        </td>
                        <td className="px-2 py-2 text-sm text-green-600 font-medium text-center">
                          {lorryInfo.cases_returned}
                        </td>
                        <td className="px-2 py-2 text-sm text-green-600 font-medium text-center">
                          {lorryInfo.bottles_returned}
                        </td>
                      </React.Fragment>
                    );
                  })}

                  {/* Current Stock */}
                  <td className="px-2 py-2 text-sm font-medium text-center">
                    {item.current_stock_case}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium text-center">
                    {item.current_stock_bottles}
                  </td>

                  {/* Financial Info */}
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {item.total_bottles}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {formatCurrency(item.total_value)}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {item.no_of_sale_units}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {formatCurrency(item.sale_income)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11 + lorryIds.length * 4}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No data available for the selected period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummeryOverview;
