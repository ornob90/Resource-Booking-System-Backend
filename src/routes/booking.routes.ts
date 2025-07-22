import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";

const router = Router();

// GET
router.get("/", bookingController.getBookings);

// POST
router.post("/", bookingController.createBooking);

// DELETE


export default router;
