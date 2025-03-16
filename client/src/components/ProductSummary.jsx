import React from "react";

const ProductSummary = ({ reportData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b border-r">Size</th>
            <th className="py-2 px-4 border-b border-r">Brand</th>
            <th className="py-2 px-4 border-b border-r">Case of Product</th>
            <th className="py-2 px-4 border-b border-r">Unit Price</th>
            <th className="py-2 px-4 border-b border-r">Selling Price</th>
            <th className="py-2 px-4 border-b border-r">Profit Margin</th>
            <th className="py-2 px-4 border-b border-r">Case Price</th>
            <th className="py-2 px-4 border-b">Cases in Stock</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="py-2 px-4 border-b border-r">{item.size}</td>
              <td className="py-2 px-4 border-b border-r">{item.brand}</td>
              <td className="py-2 px-4 border-b border-r">
                {item.product_name}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                ${item.unit_price?.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                ${item.selling_price?.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                ${item.profit_margin?.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                ${item.case_price?.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b text-right">
                {item.cases_in_stock}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductSummary;
