import mongoose from "mongoose";

const mongouri=process.env.MONGO_URI;
export const mongodb = async() => {
  try {    
    await mongoose.connect(mongouri);
    console.log("MongoDB successfully connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

