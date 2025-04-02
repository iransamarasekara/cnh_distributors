import React from "react";

const OverviewTab = ({ discounts, shops }) => {
  // Calculate remaining discount limits for each shop
  const calculateRemainingDiscounts = () => {
    const shopDiscounts = {};

    // Initialize with total limits
    shops.forEach((shop) => {
      shopDiscounts[shop.shop_id] = {
        name: shop.shop_name,
        type: shop.discountType?.discount_name || "Unknown",
        totalLimit: shop.max_discounted_cases || 0,
        used: 0,
        total_value: 0,
        remaining: shop.max_discounted_cases || 0,
        percentage: 100,
      };
    });

    // Calculate used discounts
    discounts.forEach((discount) => {
      if (shopDiscounts[discount.shop_id]) {
        // Accumulate discounted cases instead of value
        shopDiscounts[discount.shop_id].used += discount.discounted_cases || 0;
        shopDiscounts[discount.shop_id].remaining =
          shopDiscounts[discount.shop_id].totalLimit -
          shopDiscounts[discount.shop_id].used;

        //calculate Total discount value
        shopDiscounts[discount.shop_id].total_value +=
          discount.total_discount || 0;

        // Calculate percentage remaining
        const percentage =
          shopDiscounts[discount.shop_id].totalLimit > 0
            ? (shopDiscounts[discount.shop_id].remaining /
                shopDiscounts[discount.shop_id].totalLimit) *
              100
            : 0;

        shopDiscounts[discount.shop_id].percentage = Math.max(
          0,
          Math.round(percentage)
        );
      }
    });

    return Object.values(shopDiscounts);
  };

  const shopDiscountData = calculateRemainingDiscounts();
  
  // Calculate summary data for all shops
  const calculateSummaryData = () => {
    const summary = {
      totalLimit: 0,
      totalUsed: 0,
      totalRemaining: 0,
      totalDiscountValue: 0,
    };
    
    shopDiscountData.forEach((shop) => {
      summary.totalLimit += shop.totalLimit;
      summary.totalUsed += shop.used;
      summary.totalRemaining += shop.remaining;
      summary.totalDiscountValue += shop.total_value;
    });
    
    return summary;
  };
  
  const summaryData = calculateSummaryData();

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left side - Shop-specific discount limits */}
      <div className="md:w-2/3">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <span className="inline-block w-2 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded mr-3"></span>
          Shops Discount Limits
        </h2>

        <div className="gap-5 max-w-2xl grid md:grid-cols-2">
          {shopDiscountData.map((shop) => (
            <div
              key={shop.name}
              className="rounded-xl p-5 shadow-md mb-4 bg-white border-l-4 transition-all hover:shadow-lg"
              style={{
                borderLeftColor: shop.percentage > 50 ? '#10B981' : shop.percentage > 20 ? '#F59E0B' : '#EF4444',
                background: 'linear-gradient(to bottom right, white, #f8fafc)'
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800">{shop.name}</h3>
                <span className="text-xs font-medium px-3 py-1 rounded-full text-white" 
                  style={{ 
                    background: 'linear-gradient(to right, #6366f1, #8b5cf6)'
                  }}>
                  {shop.type}
                </span>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount Limit:</span>
                  <span className="font-medium">{shop.totalLimit} cases</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-medium">{shop.used} cases</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">{shop.remaining} cases</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-medium">LKR {shop.total_value.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{ 
                      width: `${shop.percentage}%`,
                      background: shop.percentage > 50
                        ? 'linear-gradient(to right, #34d399, #10B981)'
                        : shop.percentage > 20
                        ? 'linear-gradient(to right, #fbbf24, #F59E0B)'
                        : 'linear-gradient(to right, #f87171, #EF4444)'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className={`${shop.percentage < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                    {shop.used} used
                  </span>
                  <span className={`font-medium ${
                    shop.percentage > 50 ? 'text-green-600' : 
                    shop.percentage > 20 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {shop.percentage}% remaining
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {shopDiscountData.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>No shops with discount limits found.</p>
            <p className="text-sm mt-1">Please add shops and set discount limits.</p>
          </div>
        )}
      </div>
      
      {/* Right side - All Discount Overview */}
      <div className="md:w-1/3">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <span className="inline-block w-2 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded mr-3"></span>
          All Discount Overview
        </h2>
        
        {shopDiscountData.length > 0 ? (
          <div className="rounded-xl p-6 shadow-md bg-gradient-to-br from-white to-gray-50">
            {/* Pie Chart */}
            <div className="mb-6">
              <PieChart 
                used={summaryData.totalUsed} 
                remaining={summaryData.totalRemaining} 
              />
            </div>
            
            {/* Summary Box */}
            <div className="rounded-xl p-5 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-inner">
              <h3 className="font-medium text-center mb-4 text-indigo-800">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Limit:</span>
                  <span className="font-medium">{summaryData.totalLimit} cases</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Used:</span>
                  <span className="font-medium">{summaryData.totalUsed} cases</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Remaining:</span>
                  <span className="font-medium">{summaryData.totalRemaining} cases</span>
                </div>
                <div className="flex justify-between font-medium text-sm mt-4 pt-3 border-t border-indigo-100">
                  <span className="text-indigo-800">Total Discount Value:</span>
                  <span className="text-indigo-800">LKR {summaryData.totalDiscountValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300 h-full flex flex-col justify-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <p>No data available for discount overview.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced SVG-based Pie Chart Component
const PieChart = ({ used, remaining }) => {
  const total = used + remaining;
  
  // Calculate percentages and angles
  const usedPercentage = total > 0 ? Math.round((used / total) * 100) : 0;
  const remainingPercentage = 100 - usedPercentage;
  
  // SVG parameters
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const usedAngle = (usedPercentage / 100) * 360;
  
  // Calculate SVG paths for the pie slices
  const getSlicePath = (startAngle, endAngle) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    
    return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="usedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="remainingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000033" />
          </filter>
        </defs>
        
        {/* Used portion */}
        {usedPercentage > 0 && (
          <path
            d={getSlicePath(0, usedAngle)}
            fill="url(#usedGradient)"
            stroke="#fff"
            strokeWidth="1"
            filter="url(#dropShadow)"
          />
        )}
        
        {/* Remaining portion */}
        {remainingPercentage > 0 && (
          <path
            d={getSlicePath(usedAngle, 360)}
            fill="url(#remainingGradient)"
            stroke="#fff"
            strokeWidth="1"
            filter="url(#dropShadow)"
          />
        )}
        
        {/* Inner circle for donut effect */}
        <circle cx={centerX} cy={centerY} r={radius * 0.6} fill="white" stroke="#f8fafc" strokeWidth="3" />
        
        {/* Center text */}
        <text x={centerX} y={centerY - 10} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#4b5563">
          {remainingPercentage}%
        </text>
        <text x={centerX} y={centerY + 15} textAnchor="middle" fontSize="12" fill="#6b7280">
          Remaining
        </text>
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-8 mt-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-500 mr-2"></div>
          <span className="text-sm text-gray-600">Used ({usedPercentage}%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 mr-2"></div>
          <span className="text-sm text-gray-600">Remaining ({remainingPercentage}%)</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;