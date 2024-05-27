import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'node:http'
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { Message } from './src/models/Message.js';
import { router } from './src/Routes/index.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

try {
  const db = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connection established to the "${db.connection.name}" MongoDB.`);
} catch (error) {
  console.log(error);
}

app.use(cors())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);

const PORT = 3001 || process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: '*',
  },
  connectionStateRecovery: {}
});

const userSockets = {};

io.on('connection', async (socket) => {
  let token
  let userID;
  let username;

  socket.on('authentication', async (data) => {
    token = data;

    socket.on('logout', (data) => {
      token = data.token
      delete userSockets[data.userID];
    })

  if (token === 'Anonymous') {
    socket.on('anonymous_message', (data) => {
      socket.broadcast.emit('receive_message', {
        message: data.message,
        from: 'Anonymous'
      })
    })
  }

  if (token && token !== 'Anonymous') {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Message.findOne({ username: payload.username });
    if (!user) {
      console.log('User not found');
      return
    }
    userID = user._id;
    username = user.username;
    userSockets[userID] = {
      username: username,
      socketID: socket.id
    };
    socket.emit('user_connected', { userID, users: userSockets });

    // socket.on('disconnect', () => {
    //   userSockets.delete(user._id);
    // });

  }

  socket.on('send_message_to_user', async (body) => {
    const { to, message } = body;

    const toUser = userSockets[to];
    if (toUser.socketID) {
      socket.broadcast.to(toUser.socketID).emit('receive_message', {
        message,
        from: username,
      });
    }
  })
  })

  // if(!socket.recovered) {
  //   try {
  //     const result = await Message.findOne({token});

  //     if (!result) {
  //       return;
  //     }
  //     result.body.forEach((field) => {
  //       io.emit('message', {
  //         body: field,
  //         from: result.username,
  //       })
  //     })
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }  


});

app.use('/api', router);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});