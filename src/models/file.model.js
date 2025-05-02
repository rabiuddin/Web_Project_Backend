import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const fileSchema = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    name: {
      type: String,
      default: "New File",
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    Timestamp: true,
  }
);

export const File = mongoose.model("File", fileSchema);
