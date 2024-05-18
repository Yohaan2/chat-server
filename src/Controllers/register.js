import { Message } from '../models/Message.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
  let { username, password, email } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    await Message.create({ username, password, email });

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};