import express from 'express';
import { loginUser,registerUser,adminLogin,googleLogin,removeAllUsers } from '../controllers/userController.js';
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.post('/google',googleLogin)
userRouter.post('/removeall',adminAuth,removeAllUsers)

export default userRouter;