import express from 'express';
import {logout} from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router=express.Router();

router.post("/logout",authMiddleware,logout);

export default router;