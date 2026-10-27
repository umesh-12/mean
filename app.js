import express from "express";
import cors from "cors";
import productRoutes from "./routes/products.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json({ limit: "10kb" }));

app.use("/api/products", productRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;