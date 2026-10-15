import { Product } from "../models/mongo/product.model.js";
import { buildSearchQuery } from "../utils/searchHelper.js";

export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;

    if (
      name === undefined ||
      price === undefined ||
      stock === undefined ||
      category === undefined
    ) {
      return res.status(400).json({
        message: "Required product details are missing",
      });
    }

    const products = await Product.create(req.body);

    return res.status(201).json({
      message: "Product created successfully",
      products,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create product",
      error: err.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sortBy = "price:DESC",
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        message:
          "Page and limit must be valid numbers greater than or equal to 1",
      });
    }

    const validSortFields = ["name", "price", "category", "createdAt"];
    let sortField = "price";
    let sortOrder = "DESC";

    if (sortBy) {
      const parts = sortBy.toString().split(":");
      const field = parts[0]?.trim();
      const order = parts[1]?.trim().toUpperCase();

      if (!field || !validSortFields.includes(field)) {
        return res.status(400).json({ message: "Invalid sort field" });
      }
      if (order && !["ASC", "DESC"].includes(order)) {
        return res
          .status(400)
          .json({ message: "Sort order must be ASC or DESC" });
      }
      sortField = field;
      sortOrder = order || "DESC";
    }
    let condition = {
      isActive: true,
    };

    const searchCondition = buildSearchQuery(search);
    condition = { ...condition, ...searchCondition };

    if (category) {
      condition.category = category;
    }

    const products = await Product.find(condition)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortField]: sortOrder === "ASC" ? 1 : -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Product.countDocuments(condition);

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create product",
      error: err.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update product",
      error: err.message,
    });
  }
};

export const deleteProductById = async (req, res) => {
  try {
    const products = await Product.findByIdAndDelete(req.params.id);

    if (!products) {
      return res.status(404).json({ messsage: "Product not found" });
    }
    return res.status(200).json({
      message: "Product deleted successfully",
      products,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create product",
      error: err.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");

    const filteredCategories = categories
      .filter((cat) => cat && cat.trim() !== "")
      .sort();

    res.json({
      count: filteredCategories.length,
      categories: filteredCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getAllAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch admin products",
      error: err.message,
    });
  }
};

export const getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    return res.status(500).json({
      message: "something went wrong",
      error: err.message,
    });
  }
};
