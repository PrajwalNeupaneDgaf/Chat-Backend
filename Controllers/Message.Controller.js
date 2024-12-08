const Message = require("../Models/Message.model")
const User = require("../Models/User.model")

const getMyChatList = async (req, res) => {
    try {
      const myMessages = await Message.find({
        $or: [
          { sender: req.user._id },
          { receiver: req.user._id }
        ]
      }).populate({
        path: "sender receiver",
        select: "_id userName fullName avatar"
      });
  
      const usersSet = new Set();
  
      myMessages.forEach((message) => {
        const otherUser = message.sender._id.toString() === req.user._id.toString()
          ? message.receiver
          : message.sender;
  
        // Add user details to the set
        usersSet.add(otherUser._id.toString());
      });
  
      // Map through the unique user IDs and extract user information
      const uniqueChatUsers = await User.find({
        _id: { $in: Array.from(usersSet) }
      }).select("_id userName fullName avatar timestamp");
  
      res.status(200).json({
        chatList: uniqueChatUsers,
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
    return res.status(200).json({
        messages
    })
  }

  const SendMesage = async (req,res)=>{
    const {to} = req.params;
    const {message} = req.body;
    const date = new Date()
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const newDate = `${hours}:${minutes} ${ampm}`;
    const newMessage = new Message({
        sender:req.user._id ,
        receiver:to ,
        content:message ,
        timestamp:newDate
        });
        await newMessage.save();
        res.status(200).json({
          message:"Message sent successfully",
          })

  }

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
          // Only add to deletedBy if not already added
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