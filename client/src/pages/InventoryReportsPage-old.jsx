import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProductSummary from "../components/ProductSummary";
import LoadingReport from "../components/LoadingReport";
import UnloadingReport from "../components/UnloadingReport";
import LorryPerformance from "../components/LorryPerformance";
import SummeryOverview from "../components/SummeryOverview";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const InventoryReportsPage = () => {
  const [activeTab, setActiveTab] = useState("ProductSummary");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [lorryData, setLorryData] = useState([]);

  // For filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedLorry, setSelectedLorry] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const tabs = [
    "ProductSummary",
    "LoadingReport",
    "UnloadingReport",
    "LorryPerformance",
    "Overview",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch products
        const productsResponse = await axios.get(`${API_URL}/products`);
        setProductData(productsResponse.data);

        // Fetch lorries
        const lorriesResponse = await axios.get(`${API_URL}/lorries`);
        setLorryData(lorriesResponse.data);

        // Fetch report data based on active tab and filters
        // await fetchReportData();

        setError(null);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]); // Re-fetch when tab changes

  // Fetch report data based on active tab and filters
  // const fetchReportData = async () => {
  //   try {
  //     setIsLoading(true);

  //     // Format dates for API request
  //     const startDate = dateRange.startDate.toISOString().split("T")[0];
  //     const endDate = dateRange.endDate.toISOString().split("T")[0];

  //     // Construct query parameters
  //     const params = new URLSearchParams();
  //     params.append("startDate", startDate);
  //     params.append("endDate", endDate);
  //     if (selectedProduct) params.append("productId", selectedProduct);
  //     if (selectedLorry) params.append("lorryId", selectedLorry);

  //     // Determine endpoint based on active tab
  //     let endpoint;
  //     switch (activeTab) {
  //       case "ProductSummary":
  //         endpoint = "product-summary";
  //         break;
  //       case "LoadingReport":
  //         endpoint = "loading-report";
  //         break;
  //       case "UnloadingReport":
  //         endpoint = "unloading-report";
  //         break;
  //       case "LorryPerformance":
  //         endpoint = "lorry-performance";
  //         break;
  //       case "Overview":
  //         endpoint = "overview";
  //         break;
  //       default:
  //         endpoint = "product-summary";
  //     }

  //     const response = await axios.get(
  //       `${API_URL}/reports/${endpoint}?${params.toString()}`
  //     );
  //     setReportData(response.data);
  //   } catch (err) {
  //     setError(`Failed to fetch ${activeTab} data`);
  //     console.error(err);
  //     // Set sample data for demonstration
  //     setReportData(getSampleData(activeTab));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Handle product filter change
  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  // Handle lorry filter change
  const handleLorryChange = (e) => {
    setSelectedLorry(e.target.value);
  };

  // Apply filters
  const applyFilters = () => {
    fetchReportData();
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedProduct("");
    setSelectedLorry("");
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
    });

    // Fetch with reset filters
    setTimeout(() => {
      fetchReportData();
    }, 0);
  };

  // Generate sample data for demonstration
  const getSampleData = (tabName) => {
    switch (tabName) {
      case "ProductSummary":
        return [
          {
            product_name: "Coca Cola 330ml",
            size: "330ml",
            brand: "Coca Cola",
            cases_in_stock: 450,
            unit_price: 10.5,
            selling_price: 12.0,
            profit_margin: 1.5,
            case_price: 126.0,
          },
          {
            product_name: "Sprite 500ml",
            size: "500ml",
            brand: "Sprite",
            cases_in_stock: 320,
            unit_price: 12.75,
            selling_price: 15.0,
            profit_margin: 2.25,
            case_price: 180.0,
          },
          {
            product_name: "Fanta Orange 1L",
            size: "1L",
            brand: "Fanta",
            cases_in_stock: 275,
            unit_price: 18.5,
            selling_price: 22.0,
            profit_margin: 3.5,
            case_price: 264.0,
          },
          {
            product_name: "Water 500ml",
            size: "500ml",
            brand: "Pure",
            cases_in_stock: 550,
            unit_price: 5.0,
            selling_price: 8.0,
            profit_margin: 3.0,
            case_price: 96.0,
          },
        ];
      case "LoadingReport":
        return [
          {
            date: "2025-03-01",
            lorry_number: "Lorry 1",
            product_name: "Coca Cola 330ml",
            cases: 50,
            total_amount: 6300.0,
          },
          {
            date: "2025-03-02",
            lorry_number: "Lorry 2",
            product_name: "Sprite 500ml",
            cases: 45,
            total_amount: 8100.0,
          },
          {
            date: "2025-03-05",
            lorry_number: "Lorry 1",
            product_name: "Fanta Orange 1L",
            cases: 30,
            total_amount: 7920.0,
          },
          {
            date: "2025-03-10",
            lorry_number: "Lorry 3",
            product_name: "Water 500ml",
            cases: 80,
            total_amount: 7680.0,
          },
        ];
      case "UnloadingReport":
        return [
          {
            date: "2025-03-03",
            lorry_number: "Lorry 1",
            product_name: "Coca Cola 330ml",
            cases: 8,
            total_amount: 1008.0,
          },
          {
            date: "2025-03-07",
            lorry_number: "Lorry 2",
            product_name: "Sprite 500ml",
            cases: 5,
            total_amount: 900.0,
          },
          {
            date: "2025-03-12",
            lorry_number: "Lorry 1",
            product_name: "Fanta Orange 1L",
            cases: 3,
            total_amount: 792.0,
          },
          {
            date: "2025-03-14",
            lorry_number: "Lorry 3",
            product_name: "Water 500ml",
            cases: 12,
            total_amount: 1152.0,
          },
        ];
      case "LorryPerformance":
        return [
          {
            lorry_number: "Lorry 1",
            total_loadings: 15,
            total_unloadings: 5,
            total_cases_loaded: 380,
            total_cases_unloaded: 25,
            net_cases: 355,
          },
          {
            lorry_number: "Lorry 2",
            total_loadings: 12,
            total_unloadings: 8,
            total_cases_loaded: 310,
            total_cases_unloaded: 42,
            net_cases: 268,
          },
          {
            lorry_number: "Lorry 3",
            total_loadings: 10,
            total_unloadings: 6,
            total_cases_loaded: 290,
            total_cases_unloaded: 30,
            net_cases: 260,
          },
        ];
      default:
        return [];
    }
  };

  // Render table based on active tab
  const renderTable = () => {
    // if (isLoading) {
    //   return <div className="text-center py-6">Loading report data...</div>;
    // }

    // if (error) {
    //   return <div className="text-center py-6 text-red-500">{error}</div>;
    // }

    // if (reportData.length === 0) {
    //   return (
    //     <div className="text-center py-6">
    //       No data available for the selected filters.
    //     </div>
    //   );
    // }

    switch (activeTab) {
      case "ProductSummary":
        return <ProductSummary reportData={reportData} />;

      case "LoadingReport":
        return <LoadingReport reportData={reportData} />;

      case "UnloadingReport":
        return <UnloadingReport reportData={reportData} />;

      case "LorryPerformance":
        return <LorryPerformance reportData={reportData} />;

      case "Overview":
        return (
          <SummeryOverview
            selectedLorry={selectedLorry}
            dateRange={dateRange}
          />
        );

      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Inventory Reports</h1>

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
              {tab === "ProductSummary"
                ? "Product Summary"
                : tab === "LoadingReport"
                ? "Loading Report"
                : tab === "UnloadingReport"
                ? "Unloading Report"
                : tab === "Overview"
                ? "Overview"
                : "Lorry Performance"}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 p-4 rounded-md mt-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <button
              className="w-full border border-gray-300 rounded px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              {dateRange.startDate && dateRange.endDate
                ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                : "Select Date Range"}
            </button>
            {isDatePickerOpen && (
              <div className="absolute mt-1 bg-white border border-gray-300 p-2 rounded shadow-lg z-10">
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  onChange={(update) => {
                    setDateRange({
                      startDate: update[0],
                      endDate: update[1],
                    });
                    if (update[0] && update[1]) setIsDatePickerOpen(false);
                  }}
                  isClearable={true}
                  inline
                />
              </div>
            )}
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <div className="relative">
              <select
                className="block w-full appearance-none border border-gray-300 rounded px-4 py-2 pr-8 bg-white text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedProduct}
                onChange={handleProductChange}
              >
                <option value="">All Products</option>
                {productData.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name}
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

          {/* Lorry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lorry
            </label>
            <div className="relative">
              <select
                className="block w-full appearance-none border border-gray-300 rounded px-4 py-2 pr-8 bg-white text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedLorry}
                onChange={handleLorryChange}
              >
                <option value="">All Lorries</option>
                {lorryData.map((lorry) => (
                  <option key={lorry.lorry_id} value={lorry.lorry_id}>
                    {lorry.lorry_number}
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

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold">
            {activeTab === "ProductSummary" ? reportData.length : "—"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Total Cases Loaded
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {activeTab === "LoadingReport"
              ? reportData.reduce((sum, item) => sum + item.cases, 0)
              : activeTab === "LorryPerformance"
              ? reportData.reduce(
                  (sum, item) => sum + item.total_cases_loaded,
                  0
                )
              : "—"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Total Cases Unloaded
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            {activeTab === "UnloadingReport"
              ? reportData.reduce((sum, item) => sum + item.cases, 0)
              : activeTab === "LorryPerformance"
              ? reportData.reduce(
                  (sum, item) => sum + item.total_cases_unloaded,
                  0
                )
              : "—"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Net Inventory Change
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {activeTab === "LorryPerformance"
              ? reportData.reduce((sum, item) => sum + item.net_cases, 0)
              : "—"}
          </p>
        </div>
      </div>

      {/* Main Report Area */}
      <div className="bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {activeTab === "ProductSummary"
            ? "Product Inventory Summary"
            : activeTab === "LoadingReport"
            ? "Loading Transactions Report"
            : activeTab === "UnloadingReport"
            ? "Unloading Transactions Report"
            : activeTab === "Overview"
            ? "Overview Report"
            : "Lorry Performance Report"}
        </h2>

        {renderTable()}

        {/* Export Options */}
        <div className="mt-4 flex justify-end">
          <button className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportsPage;
