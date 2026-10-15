import mongoose from "mongoose";

const processedEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true, // Enforces exact DB-level uniqueness for Webhook Event IDs
    },
    eventType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "completed",
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ProcessedEvent = mongoose.model(
  "ProcessedEvent",
  processedEventSchema
);