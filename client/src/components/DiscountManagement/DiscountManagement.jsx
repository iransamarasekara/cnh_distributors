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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Discount Limits Overview</h2>

      <div className="gap-4 max-w-2xl">
        {shopDiscountData.map((shop) => (
          <div
            key={shop.name}
            className="border-2 border-gray-400 rounded-lg p-4 shadow-sm mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{shop.name}</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                {shop.type}
              </span>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Discount Limit:</span>
                <span className="font-medium">{shop.totalLimit} cases</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Used:</span>
                <span className="font-medium">{shop.used} cases</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining:</span>
                <span className="font-medium">{shop.remaining} cases</span>
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
