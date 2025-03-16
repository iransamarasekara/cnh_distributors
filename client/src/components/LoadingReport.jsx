import React from "react";

const LoadingReport = ({ reportData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b border-r">Date</th>
            <th className="py-2 px-4 border-b border-r">Lorry</th>
            <th className="py-2 px-4 border-b border-r">Product</th>
            <th className="py-2 px-4 border-b border-r">Cases</th>
            <th className="py-2 px-4 border-b">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="py-2 px-4 border-b border-r">
                {new Date(item.date).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 border-b border-r">
                {item.lorry_number}
              </td>
              <td className="py-2 px-4 border-b border-r">
                {item.product_name}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                {item.cases}
              </td>
              <td className="py-2 px-4 border-b text-right">
                ${item.total_amount?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-blue-50">
            <td className="py-2 px-4 border-t font-semibold" colSpan="3">
              Total
            </td>
            <td className="py-2 px-4 border-t font-semibold text-right">
              {reportData.reduce((sum, item) => sum + item.cases, 0)}
            </td>
            <td className="py-2 px-4 border-t font-semibold text-right">
              $
              {reportData
                .reduce((sum, item) => sum + item.total_amount, 0)
                .toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default LoadingReport;
