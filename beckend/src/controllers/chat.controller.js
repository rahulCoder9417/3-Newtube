import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";


const createChatModel = async (req, res) => {
    const { participants } = req.body;

    if (!participants || participants.length<2) {
        throw new ApiError(400, "Owner IDs or more than two  are required.");
    }

    const chat = new Chat({
        
        participants
    });

    await chat.save();

    return res.status(201).json(new ApiResponse(201, chat, "Chat created successfully"));
};


const editMessage = async (req, res) => {
    const { chatId, newContent, number } = req.body;
    const userId = req.user._id;

    
    if (!chatId || !newContent || !number) {
        throw new ApiError(400, "Chat ID, message number, and new content are required.");
    }


    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    const participantContent = chat.content.find(
        (content) => content.owner.toString() === mongoose.Types.ObjectId(userId).toString() 
    );

    if (!participantContent) {
        throw new ApiError(404, "User not found in this chat.");
    }

  
    const messageToEdit = participantContent.messages.get(number);
    if (!messageToEdit) {
        throw new ApiError(404, "Message number not found.");
    }

    
    messageToEdit.message = newContent;

    await chat.save();

    
    return res.status(200).json(new ApiResponse(200, chat, "Message edited successfully"));
};


const deleteMessage = async (req, res) => {
    const { chatId,  number } = req.body;
    const userId = req.user._id;

    
    if (!chatId  || !number) {
        throw new ApiError(400, "Chat ID, message number are required.");
    }


    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    const participantContent = chat.content.find(
        (content) => content.owner.toString() === mongoose.Types.ObjectId(userId).toString() 
    );

    if (!participantContent) {
        throw new ApiError(404, "User not found in this chat.");
    }

  
    const messageToDelete = participantContent.messages.get(number);
    if (!messageToDelete) {
        throw new ApiError(404, "Message number not found.");
    }

    
    messageToDelete.message = "🧟‍♂️ i am deleted";

    await chat.save();

    
    return res.status(200).json(new ApiResponse(200, chat, "Message deleted successfully"));
};


const getAllChats = async (req, res) => {
    const { chatId } = req.params;
    const { page = 1, limit = 10 } = req.query;  
    
    if (!chatId) {
        throw new ApiError(400, "Chat ID is required.");
    }

    
    const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(chatId) } }, 
        { $unwind: "$content" }, 
        { $lookup: { 
            from: "users", 
            localField: "content.owner",
            foreignField: "_id",
            as: "owner_details"
        }},
        { $unwind: "$owner_details" },
        { $project: { 
            participants: 1,
            content: 1,
            owner_details: { username: 1}  
        }}
    ];

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit) 
        };

     
        const chatResult = await Chat.aggregatePaginate(Chat.aggregate(pipeline), options);

        if (!chatResult || chatResult.docs.length === 0) {
            throw new ApiError(404, "Chat not found.");
        }

        return res.status(200).json(new ApiResponse(200, chatResult, "Chats retrieved successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};



const typeOfChat = async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    const numberOfUsers = chat.content
    if (numberOfUsers.length > 2) {
        return res.status(200).json(new ApiResponse(200, "Group Chat", "This is a group chat"));
    } else {
        return res.status(200).json(new ApiResponse(200, "Private Chat", "This is a private chat"));
    }
};


const deleteChatModel = async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    
    await chat.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Chat deleted successfully"));
};

const getPreviousNumber = (chat) => {
    let totalNumber = 0;
    chat.content.forEach(element => {
        totalNumber += element.messages.size;
    });
    return totalNumber;
};

const sendMessage = async (req, res) => {
    const { chatId, content } = req.body;
    const userId = req.user._id;

    if (!chatId || !content) {
        throw new ApiError(400, "Chat ID and content are required.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    const number = getPreviousNumber(chat);

    const ownerContent = chat.content.find(
        (contentItem) => contentItem.owner.toString() === mongoose.Types.ObjectId(userId).toString()
    );

    if (ownerContent) {
        ownerContent.messages.set(number.toString(), { message: content, timestamp: new Date().toISOString() });
    } else {
        throw new ApiError(404, "User not found in this chat.");
    }

    await chat.save();

    return res.status(200).json(new ApiResponse(200, chat, "Message sent successfully"));
};

const addOwnerToChat = async (req, res) => {
    const { chatId, userId } = req.body;
    const admin = req.user._id; 
    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and User ID are required.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    if (chat.participants.length <= 3) {
        throw new ApiError(400, "Chat must have at least 3 members to add a new participant.");
    }

    
    if (!chat.admin.includes(admin)) {
        throw new ApiError(400, "You are not an admin.");
    }


    if (!chat.participants.includes(userId)) {
        chat.participants.push(userId);

       
        chat.content.push({
            owner: userId,
            messages: new Map(),
        });

  
        const adminContent = chat.content.find(content => content.owner.toString() === admin.toString());
        if (adminContent) {
            adminContent.messages.set(Date.now(), {
                message: `${userId} added to the chat.`,
                timestamp: new Date(),
            });
        }
    }

    await chat.save();
    return res.status(200).json(new ApiResponse(200, chat, `${userId} added to chat successfully`));
};


const removeOwnerFromChat = async (req, res) => {
    const { chatId, userId } = req.body;
    const admin = req.user._id; 
    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and User ID are required.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }

    if (chat.participants.length >= 4 ) {
        throw new ApiError(400, "Chat must have at least 4 members to  remove participant.");
    }

    
    if (!chat.admin.includes(admin)) {
        throw new ApiError(400, "You are not an admin.");
    }


    if (chat.participants.includes(userId)) {
        chat.participants.pull(userId);

       ;

  
        const adminContent = chat.content.find(content => content.owner.toString() === admin.toString());
        if (adminContent) {
            adminContent.messages.set(Date.now(), {
                message: `${userId} removed to the chat.`,
                timestamp: new Date(),
            });
        }
    }

    await chat.save();
    return res.status(200).json(new ApiResponse(200, chat, `${userId} removed to chat successfully`));
};

const addAdminToChat = async (req, res) => {
    const { chatId, userId } = req.body;
    const admin = req.user._id; 
    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and User ID are required.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }
    if (!chat.admin.includes(admin)) {
        throw new ApiError(400, "You are not an admin.");
    }
    if(!chat.admin.includes(userId)){
    chat.admin.push(userId);
    const adminContent = chat.content.find(content => content.owner.toString() === admin.toString());
    if (adminContent) {
        adminContent.messages.set(Date.now(), {
            message: `${userId} was added as an admin.`,
            timestamp: new Date(),
        });
    }

        await chat.save();
        return res.status(200).json(new ApiResponse(200, chat, `${userId} added as admin`));
    } else {
        return res.status(200).json(new ApiResponse(200, null, `${userId} is already an admin.`));
    }
};

const removeAdminFromChat = async (req, res) => {
    const { chatId, userId } = req.body;
    const admin = req.user._id; 
    if (!chatId || !userId) {
        throw new ApiError(400, "Chat ID and User ID are required.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new ApiError(404, "Chat not found.");
    }
    if (!chat.admin.includes(admin)) {
        throw new ApiError(400, "You are not an admin.");
    }
    if(chat.admin.includes(userId)){
    chat.admin.pull(userId);
    const adminContent = chat.content.find(content => content.owner.toString() === admin.toString());
    if (adminContent) {
        adminContent.messages.set(Date.now(), {
            message: `${userId} was removed as an admin.`,
            timestamp: new Date(),
        });
    }

        await chat.save();
        return res.status(200).json(new ApiResponse(200, chat, `${userId} removed as admin`));
    } else {
        return res.status(200).json(new ApiResponse(200, null, `${userId} is not an admin.`));
    }
};


export {
    createChatModel,
    editMessage,
    deleteMessage,
    getAllChats,
    typeOfChat,
    deleteChatModel,
    sendMessage,
    removeAdminFromChat,
    removeOwnerFromChat,
    addAdminToChat,
    addOwnerToChat
};
