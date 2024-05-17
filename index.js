import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'node:http'
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { Message } from './models/Message.js';

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

const server = createServer(app);

const PORT = 3001 || process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: '*',
  },
  connectionStateRecovery: {}
});

io.on('connection', async (socket) => {
  const token = socket.handshake.auth.token;
  socket.on('message', async (body) => {
    const username = socket.handshake.auth.username ?? 'Anonymous';

    try {
      const user = await Message.findOne({ username });
      
      if (!user) {
        await Message.create({
          body,
          username: username,
          token
        })

      } else {
        user.body.push(body);
        await user.save();
      }
    } catch (error) {
      console.log(error.message);
    }

    io.emit('message', {
      body,
      from: username,
    })
  })

  if(!socket.recovered) {
    try {
      const result = await Message.findOne({token});

      if (!result) {
        return;
      }
      result.body.forEach((field) => {
        io.emit('message', {
          body: field,
          from: result.username,
        })
      })
    } catch (error) {
      console.log(error);
    }
  }  
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});