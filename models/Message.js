import { Schema, model } from 'mongoose';

const MessageSchema = new Schema({
  body: Array,
  from: String,
  username: String,
  token: String,
})

export const Message = model('Message', MessageSchema, 'Messages');