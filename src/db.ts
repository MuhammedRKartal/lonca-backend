import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.DATABASE_URL || "";
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MONGODB CONNECTION ERROR!\n", error);
    process.exit(1);
  }
};

export default connectDB;
