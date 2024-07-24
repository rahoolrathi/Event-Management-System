const { Types } = require("mongoose");

exports.getChatListQuery = (userId) => {
    return [
        // Match only the chats that have at least one message
        {

            $match: {
                lastMessage: { $exists: true },
                users: Types.ObjectId(userId), // Match chats where the user is a participant
                deletedBy: { $ne: Types.ObjectId(userId) }

            },
        },
        // lookup users who is not equal to userId using pipeline
        {
            $lookup: {
                from: "users",
                let: { users: "$users" },
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
        // lookup lastMessage
        {
            $lookup: {
                from: "messages",
                localField: "lastMessage",
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
        { $project: { unreadMessages: 0
         } },
    ];
};