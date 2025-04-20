import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.info(
      `\n MongoDB connected !! DB HOSTP: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGO DB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;
