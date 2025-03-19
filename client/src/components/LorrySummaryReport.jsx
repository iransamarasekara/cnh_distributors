import React, { useRef } from "react";

const LorrySummaryReport = ({ 
  consolidatedData, 
  lorryData, 
  lorryIds, 
  dateRange, 
  isLoading, 
  error 
}) => {
  const printRef = useRef();

  if (isLoading) {
    return <div className="text-center py-8">Loading lorry summary data...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  // Process data to create a lorry-centric summary
  const processLorrySummary = () => {
    const lorrySummary = {};
    
    // Initialize lorry summary structure
    lorryIds.forEach(lorryId => {
      const lorryNumber = lorryData.find(l => l.lorry_id === lorryId)?.lorry_number || `Lorry ${lorryId}`;
      lorrySummary[lorryId] = {
        lorry_id: lorryId,
        lorry_number: lorryNumber,
        total_cases_loaded: 0,
        total_bottles_loaded: 0,
        total_cases_returned: 0,
        total_bottles_returned: 0,
        products: []
      };
    });
    
    // Populate with data from consolidated data
    consolidatedData.forEach(item => {
      lorryIds.forEach(lorryId => {
        const lorryInfo = item.lorry_data[lorryId] || {
          cases_loaded: 0,
          bottles_loaded: 0,
          cases_returned: 0,
          bottles_returned: 0
        };
        
        // Add to lorry totals
        lorrySummary[lorryId].total_cases_loaded += lorryInfo.cases_loaded;
        lorrySummary[lorryId].total_bottles_loaded += lorryInfo.bottles_loaded;
        lorrySummary[lorryId].total_cases_returned += lorryInfo.cases_returned;
        lorrySummary[lorryId].total_bottles_returned += lorryInfo.bottles_returned;
        
        // Add product details if there's activity
        if (
          lorryInfo.cases_loaded > 0 || 
          lorryInfo.bottles_loaded > 0 || 
          lorryInfo.cases_returned > 0 || 
          lorryInfo.bottles_returned > 0
        ) {
          lorrySummary[lorryId].products.push({
            product_id: item.product_id,
            product_name: item.product_name,
            size: item.size,
            cases_loaded: lorryInfo.cases_loaded,
            bottles_loaded: lorryInfo.bottles_loaded,
            cases_returned: lorryInfo.cases_returned,
            bottles_returned: lorryInfo.bottles_returned,
            bottles_sold: 
              (lorryInfo.cases_loaded * item.case_of_bottle + lorryInfo.bottles_loaded) - 
              (lorryInfo.cases_returned * item.case_of_bottle + lorryInfo.bottles_returned),
            loading_value: (lorryInfo.cases_loaded * item.case_of_bottle + lorryInfo.bottles_loaded) * item.unit_price,
            selling_value: (
              (lorryInfo.cases_loaded * item.case_of_bottle + lorryInfo.bottles_loaded) - 
              (lorryInfo.cases_returned * item.case_of_bottle + lorryInfo.bottles_returned)
            ) * item.selling_price,
          });
        }
      });
    });

    // Calculate totals and efficiency
    Object.values(lorrySummary).forEach(lorry => {
      lorry.total_bottles_loaded = lorry.products.reduce((sum, product) => 
        sum + (product.cases_loaded * (product.case_of_bottle || 1) + product.bottles_loaded), 0);
      
      lorry.total_bottles_returned = lorry.products.reduce((sum, product) => 
        sum + (product.cases_returned * (product.case_of_bottle || 1) + product.bottles_returned), 0);
      
      lorry.total_bottles_sold = lorry.total_bottles_loaded - lorry.total_bottles_returned;
      
      lorry.efficiency_percentage = 
        lorry.total_bottles_loaded > 0 
          ? ((lorry.total_bottles_sold / lorry.total_bottles_loaded) * 100).toFixed(2) 
          : 0;
          
      lorry.total_sales_value = lorry.products.reduce((sum, product) => 
        sum + product.selling_value, 0);
    });

    return Object.values(lorrySummary);
  };

  const lorrySummaryData = processLorrySummary();

  // Handle print function
  const handlePrint = () => {
    const content = printRef.current;
    const printWindow = window.open("", "", "height=600,width=800");

    printWindow.document.write("<html><head><title>Lorry Summary Report</title>");
    printWindow.document.write(`
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { text-align: center; margin-bottom: 10px; }
        p { text-align: center; margin-bottom: 20px; color: #666; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 4px; font-size: 12px; }
        thead th { background-color: #f0f0f0; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .lorry-section { margin-bottom: 40px; }
        .lorry-header { background-color: #e0e0e0; padding: 8px; margin-bottom: 10px; }
      </style>
    `);

    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2>Lorry Summary Report</h2>");
    printWindow.document.write(
      `<p>Period: ${
        dateRange?.startDate?.toLocaleDateString() || "All time"
      } to ${dateRange?.endDate?.toLocaleDateString() || "Present"}</p>`
    );
    printWindow.document.write(content.innerHTML);
    printWindow.document.write("</body></html>");

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Export CSV function
  const downloadCSV = () => {
    if (lorrySummaryData.length === 0) {
      alert("No data available to export");
      return;
    }

    // Create CSV content
    let csvContent = "Lorry ID,Lorry Number,Total Cases Loaded,Total Bottles Loaded,Total Cases Returned,Total Bottles Returned,Total Bottles Sold,Efficiency Percentage,Total Sales Value\n";

    lorrySummaryData.forEach(lorry => {
      csvContent += `${lorry.lorry_id},${lorry.lorry_number},${lorry.total_cases_loaded},${lorry.total_bottles_loaded},${lorry.total_cases_returned},${lorry.total_bottles_returned},${lorry.total_bottles_sold},${lorry.efficiency_percentage}%,${lorry.total_sales_value.toFixed(2)}\n`;
      
      // Add products header
      csvContent += ",,Product ID,Product Name,Size,Cases Loaded,Bottles Loaded,Cases Returned,Bottles Returned,Bottles Sold,Loading Value,Selling Value\n";
      
      // Add products data
      lorry.products.forEach(product => {
        csvContent += `,,${product.product_id},"${product.product_name}",${product.size},${product.cases_loaded},${product.bottles_loaded},${product.cases_returned},${product.bottles_returned},${product.bottles_sold},${product.loading_value.toFixed(2)},${product.selling_value.toFixed(2)}\n`;
      });
      
      // Add empty line between lorries
      csvContent += "\n";
    });

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    const startDate = dateRange?.startDate?.toLocaleDateString().replace(/\//g, "-") || "all";
    const endDate = dateRange?.endDate?.toLocaleDateString().replace(/\//g, "-") || "present";
    link.setAttribute("download", `lorry-summary-${startDate}-to-${endDate}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto">
      <div ref={printRef} className="lorry-summary-container">
        {lorrySummaryData.length > 0 ? (
          lorrySummaryData.map(lorry => (
            <div key={lorry.lorry_id} className="mb-8 border border-gray-300 rounded-lg shadow-sm">
              <div className="bg-gray-100 p-3 rounded-t-lg border-b border-gray-300">
                <h3 className="text-lg font-bold">{lorry.lorry_number}</h3>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-sm text-gray-500">Total Bottles Loaded</p>
                    <p className="text-lg font-semibold">{lorry.total_bottles_loaded.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-sm text-gray-500">Total Bottles Returned</p>
                    <p className="text-lg font-semibold">{lorry.total_bottles_returned.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-sm text-gray-500">Bottles Sold</p>
                    <p className="text-lg font-semibold">{lorry.total_bottles_sold.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-sm text-gray-500">Efficiency</p>
                    <p className="text-lg font-semibold">{lorry.efficiency_percentage}%</p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <h4 className="text-md font-semibold mb-2">Product Details</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cases Loaded</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Bottles Loaded</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cases Returned</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Bottles Returned</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Bottles Sold</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sales Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lorry.products.map((product, index) => (
                        <tr key={`${lorry.lorry_id}-${product.product_id}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-3 py-2 text-sm text-gray-900">{product.product_name}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{product.size}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">{product.cases_loaded}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">{product.bottles_loaded}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">{product.cases_returned}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">{product.bottles_returned}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">{product.bottles_sold}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-right">
                            {product.selling_value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan="6" className="px-3 py-2 text-right text-sm">Total:</td>
                        <td className="px-3 py-2 text-sm text-center">{lorry.total_bottles_sold.toLocaleString()}</td>
                        <td className="px-3 py-2 text-sm text-right">
                          {lorry.total_sales_value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No data available for the selected period</div>
        )}
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

export default LorrySummaryReport;
