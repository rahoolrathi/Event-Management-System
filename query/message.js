const { Types } = require("mongoose");

exports.getChatListQuery = (userId) => {
    return [
        // Match only the chats that have at least one message
        {
            $match: {
                last_message: { $exists: true },
                participants: Types.ObjectId(userId), 
                deletedBy: { $ne: Types.ObjectId(userId) }
            },
        },
        // Lookup users who are not equal to userId using pipeline
        {
            $lookup: {
                from: "users",
                let: { users: "$participants" }, 
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$_id", "$$users"] }, 
                                    { $ne: ["$_id", Types.ObjectId(userId)] },
                                ],
                            },
                        },
                    },
                ],
                as: "chat",
            },
        },
        { $unwind: { path: "$chat", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "media",
                localField: "chat.ssn_image",
                foreignField: "_id",
                as: "chat.ssn_image"
            }
        },
        {
            $lookup: {
                from: "media",
                localField: "chat.profileImage",
                foreignField: "_id",
                as: "chat.profileImage"
            }
        },
        { $unwind: { path: "$chat.profileImage", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$chat.ssn_image", preserveNullAndEmptyArrays: true } },
        // Lookup lastMessage
        {
            $lookup: {
                from: "messages",
                localField: "last_message", // Ensure the field name matches your schema
                foreignField: "_id",
                as: "lastMessage",
            },
        },
        { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
        // Lookup messages collection to get the unread messages
        {
            $lookup: {
                from: "messages",
                let: { channel: "$channel" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$channel"] }, // Same channel
                                    { $eq: ["$isRead", false] }, // Unread messages
                                    { $ne: ["$sender", Types.ObjectId(userId)] }, // Not sent by the user
                                ],
                            },
                        },
                    },
                ],
                as: "unreadMessages",
            },
        },
        // Add the 'unreadCount' field to the chat document
        {
            $addFields: {
                unreadCount: { $size: "$unreadMessages" },
            },
        },
        { $project: { unreadMessages: 0 } },
    ];
};
