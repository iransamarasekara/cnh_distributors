import React from "react";

const InventoryTable = ({ inventoryData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th
              colSpan="4"
              className="px-6 py-3 bg-blue-400 text-white text-center border-2 border-white"
            >
              Product Details
            </th>
            <th
              colSpan="4"
              className="px-6 py-3 bg-blue-400 text-white text-center border-2 border-white"
            >
              Price Details
            </th>
            <th
              colSpan="2"
              className="px-6 py-3 bg-blue-400 text-white text-center border-2 border-white"
            >
              Quantity
            </th>
            <th
              colSpan="2"
              className="px-6 py-3 bg-blue-400 text-white text-center border-2 border-white"
            >
              Total
            </th>
          </tr>
          <tr>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              SKU
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Size
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Brand
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Case of
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Unit Price
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Selling Price
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Profit Margin
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Case Price
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Case
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Single
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Total Bottles
            </th>
            <th className="px-6 py-3 bg-blue-400 text-white text-left text-xs font-medium uppercase tracking-wider border-2 border-white">
              Total Value
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inventoryData.map((item, index) => (
            <>
              <tr className={index % 2 === 0 ? "bg-gray-200" : "bg-blue-100"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.product_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.bottles_per_case}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.unit_price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.selling_price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {(item.selling_price - item.unit_price).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {(item.selling_price * item.bottles_per_case).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.cases_qty}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.bottles_qty}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.total_bottles}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-2 border-white">
                  {item.total_value.toFixed(2)}
                </td>
              </tr>
            </>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-blue-200">
            <td
              colSpan="10"
              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-2 border-white text-right"
            >
              Total:
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-2 border-white">
              {inventoryData.reduce((sum, item) => sum + item.total_bottles, 0)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-2 border-white">
              {inventoryData
                .reduce((sum, item) => sum + item.total_value, 0)
                .toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default InventoryTable;
