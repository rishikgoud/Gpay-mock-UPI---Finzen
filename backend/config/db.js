// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log("✅ [DEBUG] Mongo URI from env:", `"${process.env.MONGO_URI}"`);

    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is undefined!");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
