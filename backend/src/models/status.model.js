import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String, // Can be text or image URL
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "image"],
    default: "text",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Documents automatically delete after 24 hours (86400 seconds)
  }
});

const Status = mongoose.model("Status", statusSchema);

export default Status;
