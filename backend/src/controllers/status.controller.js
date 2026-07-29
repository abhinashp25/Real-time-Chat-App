import Status from "../models/status.model.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { validateBase64File } from "../lib/fileValidator.js";

export const uploadStatus = async (req, res) => {
  try {
    const { content, type, privacy = "everyone", allowedUsers = [], deniedUsers = [] } = req.body;
    let imageUrl = content;

    if (type === "image") {
      const validation = validateBase64File(
        content,
        ["image/jpeg", "image/png", "image/gif", "image/webp"],
        5 * 1024 * 1024 // 5MB
      );
      if (!validation.isValid) {
        return res.status(400).json({ message: `Status upload failed: ${validation.message}` });
      }
      const uploadResponse = await cloudinary.uploader.upload(content);
      imageUrl = uploadResponse.secure_url;
    }

    const newStatus = new Status({
      userId: req.user._id,
      content: imageUrl,
      type,
      privacy,
      allowedUsers,
      deniedUsers
    });

    await newStatus.save();
    
    // Populate user info before returning
    await newStatus.populate("userId", "-password");

    res.status(201).json(newStatus);
  } catch (error) {
    console.log("Error in uploadStatus controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findById(id);
    if (!status) {
      return res.status(404).json({ message: "Status update not found" });
    }
    if (status.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this status" });
    }
    await Status.findByIdAndDelete(id);
    res.status(200).json({ message: "Status deleted successfully", statusId: id });
  } catch (error) {
    console.error("Error in deleteStatus controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getStatuses = async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const statuses = await Status.find()
      .populate("userId", "-password")
      .sort({ createdAt: -1 });

    const filtered = statuses.filter(s => {
      const ownerId = s.userId?._id?.toString() || s.userId?.toString();
      if (ownerId === myId) return true; // User can always view their own status

      if (s.privacy === "selected") {
        return s.allowedUsers?.some(id => id.toString() === myId);
      }
      if (s.privacy === "except") {
        return !s.deniedUsers?.some(id => id.toString() === myId);
      }
      return true; // "everyone" or "contacts"
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error in getStatuses controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
