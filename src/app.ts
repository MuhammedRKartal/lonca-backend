import express from "express";
import cors from "cors";
import { errorHandler } from "./errorHandler";
import vendorRoutes from "./routes/vendorRoutes";
import orderRoutes from "./routes/orderRoutes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//Routes
app.use("/vendors", vendorRoutes);
app.use("/orders", orderRoutes);

app.use(errorHandler);

export default app;
