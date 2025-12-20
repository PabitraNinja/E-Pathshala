const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_ATLAS_URI) {
      throw new Error("MONGODB_ATLAS_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false, // fixes deprecation warning
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
