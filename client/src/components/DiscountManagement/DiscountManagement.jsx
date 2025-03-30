import React from "react";

const OverviewTab = ({ shops, discounts }) => {
  // Calculate remaining discount limits for each shop
  const calculateRemainingDiscounts = () => {
    const shopDiscounts = {};

    // Initialize with total limits
    shops.forEach((shop) => {
      shopDiscounts[shop.id] = {
        name: shop.name,
        type: shop.type,
        totalLimit: shop.discountLimit || 0,
        used: 0,
        remaining: shop.discountLimit || 0,
        percentage: 100,
      };
    });

    // Calculate used discounts
    discounts.forEach((discount) => {
      if (shopDiscounts[discount.shopId]) {
        shopDiscounts[discount.shopId].used += discount.value;
        shopDiscounts[discount.shopId].remaining =
          shopDiscounts[discount.shopId].totalLimit -
          shopDiscounts[discount.shopId].used;

        // Calculate percentage remaining
        const percentage =
          shopDiscounts[discount.shopId].totalLimit > 0
            ? (shopDiscounts[discount.shopId].remaining /
                shopDiscounts[discount.shopId].totalLimit) *
              100
            : 0;

        shopDiscounts[discount.shopId].percentage = Math.max(
          0,
          Math.round(percentage)
        );
      }
    });

    return Object.values(shopDiscounts);
  };

  const shopDiscountData = calculateRemainingDiscounts();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Discount Limits Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopDiscountData.map((shop) => (
          <div key={shop.name} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{shop.name}</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                {shop.type}
              </span>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Discount Limit:</span>
                <span className="font-medium">{shop.totalLimit}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Used:</span>
                <span className="font-medium">{shop.used}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining:</span>
                <span className="font-medium">{shop.remaining}</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    shop.percentage > 50
                      ? "bg-green-600"
                      : shop.percentage > 20
                      ? "bg-yellow-500"
                      : "bg-red-600"
                  }`}
                  style={{ width: `${shop.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-right mt-1">
                {shop.percentage}% remaining
              </div>
            </div>
          </div>
        ))}
      </div>

      {shopDiscountData.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No shops with discount limits found. Please add shops and set discount
          limits.
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
