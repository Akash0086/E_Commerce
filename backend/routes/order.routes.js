import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {order} from '../controllers/order.controller.js';
import {getOrder} from '../controllers/order.controller.js';
import {getSingleOrder} from '../controllers/order.controller.js';
import { cancelOrder } from "../controllers/order.controller.js";

const router=express.Router();

router.post('/',authMiddleware,order);
router.get('/',authMiddleware,getOrder);
router.get("/:orderId", authMiddleware, getSingleOrder);

router.put("/cancel/:orderId", authMiddleware, cancelOrder);

export default router;