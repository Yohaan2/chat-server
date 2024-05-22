import { Router } from 'express';
import { register } from '../Controllers/register.js';
import { verifyData, verifyEmail, verifyUsername, verifyUsernameExists, verifyToken } from '../Middlewares/handleData.js';
import { login } from '../Controllers/login.js';
import { getUser } from '../Controllers/GetUser.js';

const router = Router();


router.post('/register',[verifyData, verifyUsernameExists, verifyEmail], register);
router.post('/login',[verifyUsername], login);
router.get('/user', verifyToken, getUser);
router.post('/message', verifyToken, (req, res) => {
  res.status(200).json({ message: 'El token funciona correctamente' });
})

export { router };