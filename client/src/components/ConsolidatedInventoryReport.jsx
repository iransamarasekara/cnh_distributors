import React, { useRef } from "react";

const ConsolidatedInventoryReport = ({ 
  consolidatedData, 
  lorryData, 
  lorryIds, 
  dateRange, 
  isLoading, 
  error,
  downloadCSV,
  handlePrint
}) => {
  const printRef = useRef();

  if (isLoading) {
    return <div className="text-center py-8">Loading inventory data...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="mx-auto">
      <div
        ref={printRef}
        className="overflow-x-auto border border-gray-400 rounded-lg shadow-sm"
      >
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
                colSpan="5"
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
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                Gross Profit
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
                    {item.unit_price.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {item.selling_price.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {item.profit_margin}
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
                    {item.total_bottles.toLocaleString()}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-right">
                    {item.total_value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-center">
                    {item.no_of_sale_units.toLocaleString()}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-900 text-right">
                    {item.sale_income.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-2 pr-4 py-2 text-sm text-gray-900 text-right">
                    {item.gross_profit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
            {consolidatedData.length > 0 && (
              <tr className="bg-gray-100 font-bold">
                <td
                  colSpan={6 + lorryIds.length * 4}
                  className="px-2 py-2 text-right text-sm"
                >
                  Totals:
                </td>
                <td className="px-2 py-2 text-sm text-center">
                  {consolidatedData
                    .reduce((total, item) => total + item.current_stock_case, 0)
                    .toLocaleString()}
                </td>
                <td className="px-2 py-2 text-sm text-center">
                  {consolidatedData
                    .reduce(
                      (total, item) => total + item.current_stock_bottles,
                      0
                    )
                    .toLocaleString()}
                </td>
                <td className="px-2 py-2 text-sm text-center">
                  {consolidatedData
                    .reduce((total, item) => total + item.total_bottles, 0)
                    .toLocaleString()}
                </td>
                <td className="px-2 py-2 text-sm text-right">
                  {consolidatedData
                    .reduce((total, item) => total + item.total_value, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className="px-2 py-2 text-sm text-center">
                  {consolidatedData
                    .reduce((total, item) => total + item.no_of_sale_units, 0)
                    .toLocaleString()}
                </td>
                <td className="px-2 py-2 text-sm text-right">
                  {consolidatedData
                    .reduce((total, item) => total + item.sale_income, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className="px-2 pr-4 py-2 text-sm text-right">
                  {consolidatedData
                    .reduce((total, item) => total + item.gross_profit, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={downloadCSV}
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Export CSV
        </button>
        <button
          onClick={() => handlePrint(printRef)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Print Report
        </button>
      </div>
    </div>
  );
};

export default ConsolidatedInventoryReport;