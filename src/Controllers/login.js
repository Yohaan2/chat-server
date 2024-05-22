import { Message } from '../models/Message.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Message.findOne({ username });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET);

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}