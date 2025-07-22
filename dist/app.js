import cors from "cors";
import express from "express";
import bookingRoutes from "./routes/booking.routes";
import { errorHandler } from "./middleware/error.middleware";
const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",
}));
app.use("/api/bookings", bookingRoutes);
app.use(errorHandler);
export default app;
