const db = require("../models");

const seedSubDiscountTypes = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected.");

    const subDiscountTypes = [
      { sub_discount_type: "ALL WO MPET", discount_amount: 330.0 },
      { sub_discount_type: "ALL MPET", discount_amount: 330.0 },
      { sub_discount_type: "MPET (SSG)", discount_amount: 200.0 },
      { sub_discount_type: "RGB", discount_amount: 200.0 },
      { sub_discount_type: "MPET (SPC)", discount_amount: 200.0 },
      { sub_discount_type: "LPET", discount_amount: 200.0 },
    ];

    for (const data of subDiscountTypes) {
      const existingEntry = await db.SubDiscountType.findOne({
        where: { sub_discount_type: data.sub_discount_type },
      });

      if (!existingEntry) {
        await db.SubDiscountType.create({
          ...data,
          created_at: new Date(),
          updated_at: new Date(),
        });
        console.log(`Sub-discount type '${data.sub_discount_type}' added.`);
      } else {
        console.log(
          `Sub-discount type '${data.sub_discount_type}' already exists.`
        );
      }
    }
  } catch (error) {
    console.error("Error seeding sub-discount types:", error);
  } finally {
    await db.sequelize.close();
    console.log("Seeding complete.");
    process.exit(0);
  }
};

seedSubDiscountTypes();
