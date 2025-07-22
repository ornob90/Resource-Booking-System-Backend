import * as bookingService from "../services/booking.service";
import moment from "moment";
export async function createBooking(req, res, next) {
    try {
        const { resource, startTime, endTime, requestedBy } = req.body;
        if (!resource || !startTime || !endTime || !requestedBy) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const start = moment(startTime);
        const end = moment(endTime);
        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ error: "Invalid date format" });
        }
        if (!start.isBefore(end)) {
            return res.status(400).send({
                success: false,
                message: "Start time must be earlier than end time",
                timestamp: new Date().toISOString(),
            });
        }
        const duration = end.diff(start, "minutes");
        if (duration < 15 || duration > 120) {
            return res.status(400).send({
                success: false,
                message: "Duration must be between 15 to 120 minutes",
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
    }
    catch (error) {
        next(error);
    }
}
export async function getBookings(req, res, next) {
    try {
        const { resource, date, page = "1", limit = "10", } = req.query;
        const pagination = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        };
        const result = await bookingService.getAllBookings(resource, date, pagination.page, pagination.limit);
        res.send({
            success: true,
            message: "Bookings fetched successfully",
            data: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.log("error", error.message);
        next(error);
    }
}
export async function deleteBooking(req, res, next) {
    const { id } = req.params;
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
    }
    catch (error) {
        error.status = 404;
        next(error);
    }
}
