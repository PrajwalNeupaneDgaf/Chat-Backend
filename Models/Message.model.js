const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: String, default: Date.now },
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" ,default:[]}], 
},{
  timestamps: true
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
