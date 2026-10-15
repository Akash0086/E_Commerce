import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {getCart} from '../controllers/cart.controller.js';
import {postCart} from '../controllers/cart.controller.js';
import {putCart} from '../controllers/cart.controller.js';
import {deleteCart} from '../controllers/cart.controller.js';


const router= express.Router();

router.get('/',authMiddleware,getCart);
router.post('/',authMiddleware,postCart);
router.put('/:productId',authMiddleware,putCart);
router.delete('/:productId',authMiddleware,deleteCart);

export default router;