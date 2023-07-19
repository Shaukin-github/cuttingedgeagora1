import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  fileURL: String,
  fileName: String,
  type:String,
  createdAt:Date
});

const Chat = mongoose.model('Chat', ChatSchema);

export default Chat;