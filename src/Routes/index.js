import { Router } from 'express';
import { register } from '../Controllers/register.js';
import { verifyData, verifyEmail, verifyUsername, verifyUsernameExists, verifyToken } from '../Middlewares/handleData.js';
import { login } from '../Controllers/login.js';

const router = Router();


router.post('/register',[verifyData, verifyUsernameExists, verifyEmail], register);
router.post('/login',[verifyUsername], login);
router.post('/message', verifyToken, (req, res) => {
  res.status(200).json({ message: 'El token funciona correctamente' });
})

export { router };