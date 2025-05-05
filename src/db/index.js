import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);
    console.info(
      `\nMongoDB connected! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGO DB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;
