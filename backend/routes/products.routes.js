import express from "express";
import { createProduct } from "../controllers/product.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { getAllProducts } from "../controllers/product.controller.js";
import { getProductById } from "../controllers/product.controller.js";
import { updateProduct } from "../controllers/product.controller.js";
import { deleteProductById } from "../controllers/product.controller.js";
import { getCategories } from "../controllers/product.controller.js";
import { getAllAdminProducts } from "../controllers/product.controller.js";
import { getAdminProductById } from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createProduct);

router.get("/", getAllProducts);

router.get("/categories", getCategories); //Route order matters in Express.ALWAYS put specific routes first

router.get("/admin/all", authMiddleware, adminMiddleware, getAllAdminProducts);

router.get("/admin/:id", authMiddleware, adminMiddleware, getAdminProductById);

router.get("/:id", getProductById); // Put dynamic/wildcard routes last

router.put("/:id", authMiddleware, adminMiddleware, updateProduct);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProductById);

export default router;
