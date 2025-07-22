import * as bookingService from "../services/booking.service";
import { NextFunction, Request, Response } from "express";
import moment from "moment-timezone";
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
    const { resource, startTime, endTime, requestedBy, timezone } = req.body;

    if (!resource || !startTime || !endTime || !requestedBy) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        timestamp: new Date().toISOString(),
      });
    }

    const tz = timezone || "UTC";

    const start = moment.tz(startTime, tz);
    const end = moment.tz(endTime, tz);

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
        timestamp: new Date().toISOString(),
      });
    }

    if (!start.isBefore(end)) {
      return res.status(400).json({
        success: false,
        message: "Start time must be earlier than end time",
        timestamp: new Date().toISOString(),
      });
    }

    const duration = end.diff(start, "minutes");

    if (
      duration < bookingService.MIN_DURATION_MINUTES ||
      duration > bookingService.MAX_DURATION_MINUTES
    ) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 15 to 120 minutes",
        timestamp: new Date().toISOString(),
      });
    }

    // Convert to UTC before checking conflict & saving
    const startUtc = start.utc().toISOString();
    const endUtc = end.utc().toISOString();

    const hasConflict = await bookingService.isConflictingBooking({
      resource,
      startTime: startUtc,
      endTime: endUtc,
      requestedBy,
    });

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: "Booking conflicts with existing one",
        timestamp: new Date().toISOString(),
      });
    }

    const booking = await bookingService.createBooking(
      {
        resource,
        startTime: startUtc,
        endTime: endUtc,
        requestedBy,
      },
      timezone
    );

    res.status(201).json({
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
  } catch (error: any) {
    console.log("error", error.message);
    next(error);
  }
}

export async function getAvailableSlots(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { currentTime } = req.body;

    if (!currentTime) {
      return res.status(400).json({
        success: false,
        message: "currentTime is required in request body",
        timestamp: new Date().toISOString(),
      });
    }

    const result =
      await bookingService.getGlobalAvailableTimeSlots(currentTime);

    res.status(200).json({
      success: true,
      message: "Available time slots fetched",
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
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
