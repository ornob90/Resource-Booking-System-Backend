import * as bookingService from "../services/booking.service";
import { NextFunction, Request, Response } from "express";
import moment from "moment";

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { resource, startTime, endTime, requestedBy } = req.body;

    if (!resource || !startTime || !endTime || !requestedBy) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const duration = moment(endTime).diff(moment(startTime), "minutes");

    if (duration < 15 || duration > 120) {
      return res.status(400).send({
        success: false,
        message: "Duration Must be between 15 to 120 minutes",
        timestamp: new Date().toISOString(),
      });
    }

    const hasConflict = await bookingService.isConflictingBooking({
      resource,
      startTime,
      endTime,
      requestedBy,
    });

    if (hasConflict) {
      return res.status(409).send({
        success: false,
        message: "Booking conflicts with existing one",
        tiomestamp: new Date().toISOString(),
      });
    }

    const booking = await bookingService.createBooking({
      resource,
      startTime,
      endTime,
      requestedBy,
    });

    res.status(201).send({
      success: true,
      message: "Booking created successfully!",
      data: booking,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
