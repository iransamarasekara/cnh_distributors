import React from "react";

const LorryPerformance = ({ reportData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b border-r">Lorry Number</th>
            <th className="py-2 px-4 border-b border-r">Total Loadings</th>
            <th className="py-2 px-4 border-b border-r">Total Unloadings</th>
            <th className="py-2 px-4 border-b border-r">Cases Loaded</th>
            <th className="py-2 px-4 border-b border-r">Cases Unloaded</th>
            <th className="py-2 px-4 border-b">Net Cases</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="py-2 px-4 border-b border-r">
                {item.lorry_number}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                {item.total_loadings}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                {item.total_unloadings}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                {item.total_cases_loaded}
              </td>
              <td className="py-2 px-4 border-b border-r text-right">
                {item.total_cases_unloaded}
              </td>
              <td className="py-2 px-4 border-b text-right font-medium">
                {item.net_cases}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LorryPerformance;
