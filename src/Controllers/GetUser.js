import { Message } from "../models/Message.js";

export const getUser = async (req, res) => {
  const { _id: id } = req.user
  const user = await Message.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user.toObject());
};