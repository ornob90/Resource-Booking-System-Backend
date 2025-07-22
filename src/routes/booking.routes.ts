import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";

const router = Router();

// GET


// POST
router.post("/", bookingController.createBooking)


export default router;