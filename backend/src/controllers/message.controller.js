import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
        
    } catch (error) {
        console.log("Error fetching contacts:", error);
        res.status(500).json({ Message: "Server error" });
        
    }
};

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user.id;
        const {id: userToChatId} = req.params;

        const messages = await Message.find({
            $or: [
                { sender: myId, recipient: userToChatId },
                { sender: userToChatId, recipient: myId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error fetching messages:", error.message);
        res.status(500).json({ error: "Server error" });

    }
};

export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user.id;

        if (!text && !image) {
            return res.status(400).json({ message: "Message text or image is required" });
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Cannot send message to yourself" });
        }
        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found" });
        }        

        let imageUrl;
        if(image) {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        //todo : send message in real time using socket.io

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error sending message:", error.message);
        res.status(500).json({ error: "Server error" });
        
    }
};

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const messages = await Message.find({
            $or: [
                { sender: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        });

        const chatPartnerIds = [
            ...new Set(messages.map(msg => 
                msg.senderId.toString() === loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString()
            )),
        ];
        
        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");
        res.status(200).json(chatPartners);

    } catch (error) {
        console.error("Error fetching chat partners:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

