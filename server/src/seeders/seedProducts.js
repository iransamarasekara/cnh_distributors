const db = require("../models");

const seedProducts = async () => {
  try {
    await db.sequelize.authenticate(); // Ensure DB connection
    console.log("Database connected.");

    const products = [
      // 175 mL (RGB) products
      {
        product_name: "Coca Cola",
        unit_price: 82.8,
        selling_price: 92.0,
        bottles_per_case: 24,
        size: "175 mL",
        active: true,
      },
      {
        product_name: "Sprite",
        unit_price: 82.8,
        selling_price: 92.0,
        bottles_per_case: 24,
        size: "175 mL",
        active: true,
      },
      {
        product_name: "Fanta Orange",
        unit_price: 82.8,
        selling_price: 92.0,
        bottles_per_case: 24,
        size: "175 mL",
        active: true,
      },
      {
        product_name: "Fanta Portelo",
        unit_price: 82.8,
        selling_price: 92.0,
        bottles_per_case: 24,
        size: "175 mL",
        active: true,
      },
      {
        product_name: "Fanta Cream Soda",
        unit_price: 82.8,
        selling_price: 92.0,
        bottles_per_case: 24,
        size: "175 mL",
        active: true,
      },

      // 300 mL (RGB) products
      {
        product_name: "Coca Cola",
        unit_price: 126.95,
        selling_price: 136.5,
        bottles_per_case: 24,
        size: "300 mL",
        active: true,
      },
      {
        product_name: "Sprite",
        unit_price: 126.95,
        selling_price: 136.5,
        bottles_per_case: 24,
        size: "300 mL",
        active: true,
      },
      {
        product_name: "Fanta Orange",
        unit_price: 100.0,
        selling_price: 150.0,
        bottles_per_case: 24,
        size: "300 mL",
        active: true,
      },
      {
        product_name: "Fanta Portelo",
        unit_price: 100.0,
        selling_price: 150.0,
        bottles_per_case: 24,
        size: "300 mL",
        active: true,
      },
      {
        product_name: "Fanta Cream Soda",
        unit_price: 100.0,
        selling_price: 150.0,
        bottles_per_case: 24,
        size: "300 mL",
        active: true,
      },
      {
        product_name: "Lion Club Soda",
        unit_price: 85.56,
        selling_price: 92.0,
        bottles_per_case: 24,
        size: "300 mL",
        active: true,
      },
      {
        product_name: "Tonic",
        unit_price: 100.0,
        selling_price: 150.0,
        bottles_per_case: 24,
        size: "300 mL",
        active: true,
      },

      // 750 mL products
      {
        product_name: "Coca Cola",
        unit_price: 160.81,
        selling_price: 204.6,
        bottles_per_case: 9,
        size: "750 mL",
        active: true,
      },
      {
        product_name: "Sprite",
        unit_price: 160.81,
        selling_price: 204.6,
        bottles_per_case: 9,
        size: "750 mL",
        active: true,
      },
      {
        product_name: "Fanta Orange",
        unit_price: 160.81,
        selling_price: 204.6,
        bottles_per_case: 9,
        size: "750 mL",
        active: true,
      },

      // 250 mL products
      {
        product_name: "Coca Cola",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 16,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Sprite",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 16,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Fanta Orange",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 16,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Fanta Portelo",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 16,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Fanta Cream Soda",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 16,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Lion Ginger Beer",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 16,
        size: "250 mL",
        active: true,
      },

      // 250 mL products
      {
        product_name: "Coca Cola",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 30,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Sprite",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 30,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Fanta Orange",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 30,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Fanta Portelo",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 30,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Fanta Cream Soda",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 30,
        size: "250 mL",
        active: true,
      },
      {
        product_name: "Lion Ginger Beer",
        unit_price: 104.9,
        selling_price: 111.6,
        bottles_per_case: 30,
        size: "250 mL",
        active: true,
      },

      // 400 mL products
      {
        product_name: "Coca Cola",
        unit_price: 156.38,
        selling_price: 167.25,
        bottles_per_case: 24,
        size: "400 mL",
        active: true,
      },
      {
        product_name: "Sprite",
        unit_price: 100.0,
        selling_price: 167.25,
        bottles_per_case: 24,
        size: "400 mL",
        active: true,
      },
      {
        product_name: "Fanta Orange",
        unit_price: 100.0,
        selling_price: 167.25,
        bottles_per_case: 24,
        size: "400 mL",
        active: true,
      },
      {
        product_name: "Fanta Portelo",
        unit_price: 156.38,
        selling_price: 167.25,
        bottles_per_case: 24,
        size: "400 mL",
        active: true,
      },
      {
        product_name: "Fanta Cream Soda",
        unit_price: 156.38,
        selling_price: 167.25,
        bottles_per_case: 24,
        size: "400 mL",
        active: true,
      },
      {
        product_name: "Zere Coke",
        unit_price: 100.0,
        selling_price: 167.25,
        bottles_per_case: 24,
        size: "400 mL",
        active: true,
      },
      {
        product_name: "Lion Ginger Beer",
        unit_price: 156.38,
        selling_price: 167.25,
        bottles_per_case: 24,
        size: "400 mL",
        active: true,
      },
      {
        product_name: "Lion Club Soda",
        unit_price: 100.0,
        selling_price: 93.0,
        bottles_per_case: 24,
        size: "400 mL",
        active: true,
      },
    ];

    for (const product of products) {
      const existingProduct = await db.Product.findOne({
        where: {
          product_name: product.product_name,
          size: product.size,
        },
      });

      if (!existingProduct) {
        await db.Product.create(product);
        console.log(
          `Product '${product.product_name} (${product.size})' created.`
        );
      } else {
        console.log(
          `Product '${product.product_name} (${product.size})' already exists.`
        );
      }
    }
  } catch (error) {
    console.error("Error seeding products:", error);
  } finally {
    await db.sequelize.close(); // Close DB connection properly
    console.log("Product seeding complete.");
    process.exit(0);
  }
};

seedProducts();
