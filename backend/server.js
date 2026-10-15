import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mongodb } from "./config/mongo.js";
import { sqldb } from "./config/mysql.js";
import userRoute from "./routes/user.routes.js";
import loginRoute from "./routes/login.routes.js";
import logoutRoute from "./routes/logout.routes.js";
import getProfileRoute from "./routes/getprofile.routes.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminOrderRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import { webhook } from "./controllers/payment.controller.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.post('/payments/webhook',express.raw({type:"application/json"}),webhook);

app.use(express.json());
app.use(cookieParser());


// Home route
app.get("/", (req, res) => {
  res.send("Welcome to the E-Commerce API");
});

app.use("/users", userRoute);
app.use("/users", loginRoute);
app.use("/users", logoutRoute);
app.use("/users", getProfileRoute);

app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/wishlist", wishlistRoutes);

app.use("/admin/order", adminOrderRoutes);

app.use("/payments", paymentRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 3000;

const serverStart = async () => {
  await mongodb();
  await sqldb();

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

serverStart();
