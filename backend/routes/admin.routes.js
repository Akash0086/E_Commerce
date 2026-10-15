import express from 'express';
import  authMiddleware from '../middlewares/auth.middleware.js';
import  {adminMiddleware} from '../middlewares/admin.middleware.js';
import {getAllOrder,updateOrderStatus} from '../controllers/order.controller.js';

const router= express.Router();

router.get('/',authMiddleware,adminMiddleware,getAllOrder);

router.put('/:orderId',authMiddleware,adminMiddleware,updateOrderStatus);

export default router;