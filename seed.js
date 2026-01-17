// seed.js - Run this to populate your database with initial data
require("dotenv").config();
const mongoose = require("mongoose");
const Restaurant = require("./models/Restaurant");
const Menu = require("./models/Menu");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await Restaurant.deleteMany({});
    await Menu.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create restaurants
    const restaurants = await Restaurant.insertMany([
      {
        name: "Pizza Palace",
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        rating: 4.5,
      },
      {
        name: "Burger House",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        rating: 4.3,
      },
      {
        name: "Sushi World",
        image:
          "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
        rating: 4.7,
      },
      {
        name: "Taco Fiesta",
        image:
          "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400",
        rating: 4.2,
      },
    ]);
    console.log("✅ Created restaurants");

    // Create menu items for each restaurant
    const menuItems = [];

    // Pizza Palace Menu
    menuItems.push(
      {
        restaurant_id: restaurants[0]._id,
        name: "Margherita Pizza",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
        category: "Pizza",
      },
      {
        restaurant_id: restaurants[0]._id,
        name: "Pepperoni Pizza",
        price: 349,
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
        category: "Pizza",
      },
      {
        restaurant_id: restaurants[0]._id,
        name: "Veggie Supreme",
        price: 329,
        image:
          "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400",
        category: "Pizza",
      }
    );

    // Burger House Menu
    menuItems.push(
      {
        restaurant_id: restaurants[1]._id,
        name: "Classic Burger",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        category: "Burgers",
      },
      {
        restaurant_id: restaurants[1]._id,
        name: "Cheese Burger",
        price: 229,
        image:
          "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400",
        category: "Burgers",
      },
      {
        restaurant_id: restaurants[1]._id,
        name: "Veggie Burger",
        price: 189,
        image:
          "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
        category: "Burgers",
      },
      {
        restaurant_id: restaurants[1]._id,
        name: "French Fries",
        price: 99,
        image:
          "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400",
        category: "Sides",
      }
    );

    // Sushi World Menu
    menuItems.push(
      {
        restaurant_id: restaurants[2]._id,
        name: "California Roll",
        price: 399,
        image:
          "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
        category: "Sushi",
      },
      {
        restaurant_id: restaurants[2]._id,
        name: "Salmon Nigiri",
        price: 449,
        image:
          "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400",
        category: "Sushi",
      },
      {
        restaurant_id: restaurants[2]._id,
        name: "Tuna Roll",
        price: 429,
        image:
          "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400",
        category: "Sushi",
      }
    );

    // Taco Fiesta Menu
    menuItems.push(
      {
        restaurant_id: restaurants[3]._id,
        name: "Chicken Tacos",
        price: 179,
        image:
          "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400",
        category: "Tacos",
      },
      {
        restaurant_id: restaurants[3]._id,
        name: "Beef Tacos",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400",
        category: "Tacos",
      },
      {
        restaurant_id: restaurants[3]._id,
        name: "Veggie Tacos",
        price: 159,
        image:
          "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400",
        category: "Tacos",
      },
      {
        restaurant_id: restaurants[3]._id,
        name: "Nachos",
        price: 129,
        image:
          "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400",
        category: "Sides",
      }
    );

    await Menu.insertMany(menuItems);
    console.log("✅ Created menu items");

    console.log("\n🎉 Database seeded successfully!");
    console.log(`📊 Total Restaurants: ${restaurants.length}`);
    console.log(`📊 Total Menu Items: ${menuItems.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => seedData());
