import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import agoraToken from 'agora-token'
import pkg from 'agora-access-token';
const { RtcTokenBuilder } = pkg;
const { ChatTokenBuilder } = agoraToken
import mongoose from 'mongoose';
import User from './models/User';
import Chat from './models/Chat';
import dbConnect from './utils/dbConnect';
import multer from 'multer';
import axios from 'axios';
// import { Server } from 'socket.io';
import http from 'http';

const app = express();

//const server = http.createServer(app);
//const io = new Server(server);

const port = 4000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Get the appId and appCertificate from the agora console
const appId = 'f3d98482b58a416e881ce5378f7be22e';
const appCertificate = 'bdc45866789e49ee84ea2489831e51db';
// Token expire time, hardcode to 86400 seconds = 1 day
const expirationInSeconds = 86400;

// Get the RestApiHost, OrgName, and AppName from the chat feature in agora console
const chatRegisterURL = 'http://a41.chat.agora.io/41960726/1129223/users';

app.use(cors());
app.use(express.json());

// Connect to the database
await dbConnect();
const uidString = "527841"; // Your user ID as a string
const uid = parseInt(uidString, 10); // Convert the string to an integer
console.log(uid);
app.post('/login', async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({ account: req.body.username });
   
    if (user) {
      const userToken = ChatTokenBuilder.buildUserToken(
        appId,
        appCertificate,
        user.userUuid,
        expirationInSeconds
      );

      res.status(200).json({
        code: 'RES_OK',
        expireTimestamp: expirationInSeconds,
        chatUsername: user.chatUsername,
        accessToken: userToken,
        agoraUid: user.userUuid
      });
    } else {
      res.status(401).json({
        message: 'Your account or password is wrong'
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});
app.post('/loginTest', async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({ account: req.body.username });
    
    if (user) {

      res.status(200).json({
        code: 'RES_OK',
        chatUsername: user.chatUsername,
        accessToken: makeid(100)
      });
    } else { 
      res.status(401).json({
        message: 'Your account or password is wrong'
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

app.post('/register', async (req, res) => {
  try {
    const account = req.body.username;
    const password = req.body.password;
    const chatUsername = account;
    const chatPassword = password;
    const chatNickname = account;
    const body = {
      username: chatUsername,
      password: chatPassword,
      nickname: chatNickname
    };

    const appToken = ChatTokenBuilder.buildAppToken(
      appId,
      appCertificate,
      expirationInSeconds
    );

    const response = await fetch(chatRegisterURL, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + appToken
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (response.status !== 200) {
      res.status(400).json({ success: false, data: result });
      return;
    }
    
    const user = new User({
      account: account,
      password: password,
      chatUsername: chatUsername,
      userUuid: result.entities[0].uuid
    });

    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'User Registered Successfully!', code: 'RES_OK' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

app.post('/registerTest', async (req, res) => {
  try {
    const account = req.body.username;
    const password = req.body.password;
    const chatUsername = account;
    const chatPassword = password;
    const chatNickname = account;
    
    const user = new User({
      account: account,
      password: password,
      chatUsername: chatUsername
    });

    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'User Registered Successfully!', code: 'RES_OK' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

// Add this route above app.listen()

app.post('/resetPassword', async (req, res) => {
  try {
    const { account, newPassword } = req.body;
    // Check if the user exists with the provided email
    const user = await User.findOne({ account: req.body.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password in the database with the new password
    user.password = newPassword;
    await user.save();
    
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
    const expirationTimestampInSeconds =
      currentTimestampInSeconds + expirationTimeInSeconds;
    const appToken = agoraToken.ChatTokenBuilder.buildAppToken(
      appId,
      appCertificate,
      expirationTimestampInSeconds
    );

    // Replace the placeholders with your actual values
    const apiUrl = 'http://a41.chat.agora.io/41960726/1129223/users/user1/password';
    
    const requestData = {
      newpassword: newPassword,
    };
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${appToken}`,
      },
    };
    
    axios.put(apiUrl, requestData, config)
      .then((response) => {
        console.log('Password reset successful:', response.data);
      })
      .catch((error) => {
        console.error('Error resetting password:', error.response.data);
      });
    
    // Optionally, you can invalidate any existing sessions or tokens for the user to enforce the password change.

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/token', (req, res) => {
  const channelName = req.query.channelName || 'default';
  const uid = req.query.uid || 0;
  const role = 'PUBLISHER';
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
  const expirationTimestampInSeconds =
    currentTimestampInSeconds + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    expirationTimestampInSeconds
  );

  res.status(200).json({
    code: 'RES_OK',
    expireTimestamp: expirationInSeconds,
    accessToken: token,
    agoraUid: req.query.agorauid
  });
});

app.get('/chatToken', (req, res) => {
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
  const expirationTimestampInSeconds =
    currentTimestampInSeconds + expirationTimeInSeconds;
  const appToken = agoraToken.ChatTokenBuilder.buildAppToken(
    appId,
    appCertificate,
    expirationTimestampInSeconds
  );

  res.status(200).json({ token: appToken });
});


// API endpoint to save chat data
app.post('/chat', upload.single('file'), async (req, res) => {
  try {
    const { senderId, receiverId, message, type,groupId,callStartTime,callEndTime,
      callDuration,recordingUrl} = req.body;
    let fileURL = '';
    let fileName = '';
    let createdAt= new Date();

    if (type === 'txt') {
      // Save text chat to the database
      const chat = new Chat({
        senderId,
        receiverId,
        message,
        type,
        createdAt,
        groupId
      });
      await chat.save();
    } else if (type === 'file') {
      // Handle file upload
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      fileURL = req.file.path;
      fileName = req.file.originalname;

      // Save file chat to the database
      const chat = new Chat({
        senderId,
        receiverId,
        message,
        fileURL,
        fileName,
        type,
        createdAt,
        groupId
      });
      await chat.save();
    } else if (type === 'audio') {
      // Save text chat to the database
      const chat = new Chat({
        senderId,
        receiverId,
        message,
        type,
        callStartTime,
        callEndTime,
        callDuration,
        createdAt,
        groupId
      });
      await chat.save();
    } else if (type === 'video') {
      // Save text chat to the database
      const chat = new Chat({
        senderId,
        receiverId,
        message,
        type,
        callStartTime,
        callEndTime,
        callDuration,
        createdAt,
        groupId
      });
      await chat.save();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid chat type' });
    }

    res.status(200).json({ success: true, message: 'Chat saved successfully', code: 'RES_OK' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

app.put('/chat/:id', async (req, res) => {
  try {
    const chatId = req.params.id;
    const { callStartTime,callEndTime,callDuration,recordingUrl } = req.body;
     
    
    // Find the chat entry in the database by its ID
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Update the chat message
    chat.callStartTime = callStartTime;
    chat.callEndTime = callEndTime;
    chat.callDuration = callDuration;
    chat.recordingUrl = recordingUrl;
    await chat.save();

    res.status(200).json({ success: true, message: 'Chat updated successfully', code: 'RES_OK' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});


app.get('/chat', async (req, res) => {
  try {
    const { senderId, receiverId,groupId } = req.query;
    // Check if either senderId or receiverId is provided
    /*
    if (!senderId && !receiverId) {
      return res.status(400).json({ success: false, message: 'Please provide senderId or receiverId' });
    }
    */

    let chats;

    if (senderId && receiverId) {
      // Get chats where senderId and receiverId match
      chats = await Chat.find({
        $or: [
          { "senderId": senderId, "receiverId": receiverId },
          { "senderId": receiverId, "receiverId": senderId }
        ]
      });
    } else if (senderId) {
      // Get chats where senderId matches
      chats = await Chat.find({ "senderId": senderId });
    } else if (receiverId) {
      // Get chats where receiverId matches
      chats = await Chat.find({ "receiverId":receiverId });
    } else if(groupId){
      // Get chats where receiverId matches
      chats = await Chat.find({ "groupId":groupId });
    } 

    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// io.on('connection', (socket) => {
//   console.log('New client connected.');

//   socket.emit('welcome', 'Welcome to the chat!');

//   socket.on('message', (data) => {
//     console.log('Received message:', data);
//     io.emit('message', data); // Broadcast the message to all clients
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected.');
//   });
// });

//server.listen(port, () => {
//   console.log(`Socket.IO server listening on port ${port}`);
// });