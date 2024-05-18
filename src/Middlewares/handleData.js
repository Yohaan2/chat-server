import jwt from "jsonwebtoken";
import { Message } from "../models/Message.js";

export const verifyData = (req, res, next) => {
  const requiredFields = ['username', 'password', 'email'];
  const missingField = requiredFields.find(field => !req.body[field]);
  if (missingField) {
    return res.status(400).json({ message: `Missing field: ${missingField}` });
  }

  next()
}

export const verifyUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  const user = await Message.findOne({ username });
  
  if (user) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  next()
}

export const verifyEmail = async (req, res, next) => {
  const { email } = req.body;
  const regexEmail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/
  if (!regexEmail.test(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  next()
}

export const verifyUsername = async (req, res, next) => {
  const { username } = req.body;
  const user = await Message.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: 'Username not found' });
  }

  next()
};

export const verifyToken = async (req, res, next) => {
  const header = req.header('Authorization');
  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Message.findOne({ username: payload.username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user.toObject();
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token not valid" });
  }
  next()
};