import mongoose from "mongoose";
import envConfig from "./env.js";

const connectToDatabase = async () => {
    try {
        await mongoose.connect(envConfig.mongoDB);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw err; // Let server.js handle it
    }
};

export default connectToDatabase;
