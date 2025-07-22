import moment from "moment";
import prisma from "../lib/prisma";
const BUFFER_MINUTES = 10;
const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 120;
export async function isConflictingBooking(input) {
    const { resource, startTime, endTime } = input;
    const newStart = moment(startTime).toDate();
    const newEnd = moment(endTime).toDate();
    const bufferStart = moment(newStart)
        .subtract(BUFFER_MINUTES, "minutes")
        .toDate();
    const bufferEnd = moment(newEnd).add(BUFFER_MINUTES, "minutes").toDate();
    const conflicts = await prisma.booking.findMany({
        where: {
            resource,
            OR: [
                {
                    startTime: { lte: bufferEnd },
                    endTime: { lte: bufferStart },
                },
            ],
        },
    });
    return conflicts.length > 0;
}
export async function createBooking(input) {
    const booking = await prisma.booking.create({
        data: {
            ...input,
            startTime: new Date(input.startTime),
            endTime: new Date(input.endTime),
        },
    });
    return booking;
}
export async function getAllBookings(resource, date, page = 1, limit = 10) {
    const where = {};
    if (resource)
        where.resource = resource;
    if (date) {
        const dayStart = moment(date).startOf("day").toDate();
        const dayEnd = moment(date).endOf("day").toDate();
        where.startTime = { gte: dayStart, lte: dayEnd };
    }
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            orderBy: { startTime: "asc" },
            skip,
            take: limit,
        }),
        prisma.booking.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        bookings: bookings,
        total,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
    };
}
export async function deleteBooking(id) {
    return prisma.booking.delete({ where: { id } });
}
