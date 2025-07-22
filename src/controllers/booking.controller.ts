import * as bookingService from "../services/booking.service";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import {
  DeleteBookingReqParams,
  GetBookingsReqQuery,
} from "../types/booking.types";

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

export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      resource,
      date,
      page = "1",
      limit = "10",
    } = req.query as GetBookingsReqQuery;

    const pagination = {
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 10,
    };

    const result = await bookingService.getAllBookings(
      resource,
      date,
      pagination.page,
      pagination.limit
    );

    res.send({
      success: true,
      message: "Bookings fetched successfully",
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params as DeleteBookingReqParams;

  if (!id) {
    return res.status(400).send({
      success: false,
      message: "Missing Booking ID",
      tiomestamp: new Date().toISOString(),
    });
  }

  try {
    await bookingService.deleteBooking(id);

    res.send({ success: true, message: "Booking Deleted" });
  } catch (error: any) {
    error.status = 404;
    next(error);
  }
}
