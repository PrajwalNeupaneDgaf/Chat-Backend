const Message = require("../Models/Message.model")
const User = require("../Models/User.model");
const { getReceiverId ,io } = require("../Utils/Socket.io");


const getMyChatList = async (req, res) => {
  try {
    // Fetch all messages where the user is involved (either sender or receiver)
    const myMessages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
      .populate({
        path: "sender receiver",
        select: "_id userName fullName avatar"
      })
      .sort({ timestamp: -1 }); // Sort by most recent messages first

    // Group latest message by unique user (conversation partner)
    const latestMessagesMap = new Map();

    myMessages.forEach((message) => {
      const otherUserId = message.sender._id.toString() === req.user._id.toString()
        ? message.receiver._id.toString()
        : message.sender._id.toString();

      // Update latest message only if not already stored
      if (!latestMessagesMap.has(otherUserId)) {
        latestMessagesMap.set(otherUserId, {
          user: message.sender._id.toString() === req.user._id.toString()
            ? message.receiver
            : message.sender,
          latestMessage: {
            content: message.content,
            timestamp: message.timestamp,
          },
        });
      }
    });

    // Convert map values to array and sort them by timestamp descending
    const latestMessagesList = Array.from(latestMessagesMap.values()).sort(
      (a, b) => b.latestMessage.timestamp - a.latestMessage.timestamp
    );

    res.status(200).json({
      chatList: latestMessagesList,
    });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ error: "Something went wrong while fetching chat list." });
  }
};

  
  const myMessages = async (req,res)=>{
    const {userId} = req.params;
    const messages = await Message.find({
        $or: [
            { sender: userId,receiver:req.user._id },
            { sender: req.user._id ,receiver:userId }
        ]
    }).sort({ timestamp: 1 });
    const sendMessage = messages.filter(msg => msg?.deletedBy[0]!= req.user._id);
    
    return res.status(200).json({
      sendMessage
    })
  }

  const SendMesage = async (req, res) => {
    const { to } = req.params;
    const { message } = req.body;
  
    try {
      const newMessage = new Message({
        sender: req.user._id,
        receiver: to,
        content: message,
        timestamp: Date.now(),
      }); 
        const receiverSocketId = getReceiverId([to]);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("Message", newMessage);
        }


      const savedMessage = await newMessage.save();

      res.status(200).json({
        message: "Message sent successfully",
        data: savedMessage,
      });
    } catch (error) {
      console.error("Error sending message", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  };
  

  const deleteChat = async( req,res)=>{
    try {
        const otherUserId = req.params.otherUserId; 
        const currentUserId = req.user._id; 
    
        // Update all messages between the two users by adding the current user's ID to the `deletedBy` array
        const messages = await Message.find({
          $or: [
            { sender: currentUserId, receiver: otherUserId },
            { sender: otherUserId, receiver: currentUserId },
          ],
        });
    
        if (!messages.length) {
          return res.status(404).json({ message: "No messages found between these users" });
        }
    
        // Update all found messages with the soft-delete logic
        for (let msg of messages) {
          if (!msg.deletedBy.includes(currentUserId)) {
            msg.deletedBy.push(currentUserId);
            await msg.save();
          }
    
          // If both users soft-delete, remove the message permanently
          if (msg.deletedBy.includes(msg.sender) && msg.deletedBy.includes(msg.receiver)) {
            await Message.deleteOne({ _id: msg._id });
          }
        }
    
        return res.status(200).json({
          message: "Soft delete logic applied. Messages between users checked for both deletions.",
          softDeletedCount: messages.length,
        });
      } catch (error) {
        console.error("Error in soft-delete logic:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
  }

  module.exports = {
    getMyChatList,
    SendMesage,
    deleteChat,
    myMessages

  }